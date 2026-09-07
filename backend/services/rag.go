package services

import (
	"fmt"
	"sort"
	"strings"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/models"
)

type ScoredDocument struct {
	Doc   models.KnowledgeDocument
	Score int
}

// Stop words in Indonesian to filter out during tokenization
var indonesianStopWords = map[string]bool{
	"dan": true, "di": true, "ke": true, "dari": true, "yang": true, "pada": true,
	"untuk": true, "dengan": true, "adalah": true, "itu": true, "ini": true, "saya": true,
	"kamu": true, "anda": true, "kami": true, "mereka": true, "dia": true, "ada": true,
	"bisa": true, "dapat": true, "apakah": true, "apa": true, "bagaimana": true,
	"berapa": true, "kapan": true, "kenapa": true, "mengapa": true, "dimana": true,
	"tolong": true, "mohon": true, "ingin": true, "mau": true, "tahu": true,
}

// TokenizeQuery splits query into normalized searchable keywords
func TokenizeQuery(query string) []string {
	normalized := strings.ToLower(query)
	// Replace punctuation with spaces
	replacer := strings.NewReplacer(",", " ", ".", " ", "?", " ", "!", " ", "-", " ", "(", " ", ")", " ", "/", " ")
	cleaned := replacer.Replace(normalized)

	rawTokens := strings.Fields(cleaned)
	var tokens []string
	for _, t := range rawTokens {
		t = strings.TrimSpace(t)
		if len(t) > 2 && !indonesianStopWords[t] {
			tokens = append(tokens, t)
		}
	}
	return tokens
}

// RetrieveRelevantContext performs RAG semantic retrieval from database documents
func RetrieveRelevantContext(query string, topK int) ([]models.KnowledgeDocument, string) {
	if topK <= 0 {
		topK = 3
	}

	var allDocs []models.KnowledgeDocument
	if err := database.DB.Find(&allDocs).Error; err != nil || len(allDocs) == 0 {
		return nil, ""
	}

	queryLower := strings.ToLower(strings.TrimSpace(query))
	tokens := TokenizeQuery(query)

	var scoredDocs []ScoredDocument

	for _, doc := range allDocs {
		score := 0
		docTitleLower := strings.ToLower(doc.Title)
		docContentLower := strings.ToLower(doc.Content)
		docKeywordsLower := strings.ToLower(doc.Keywords)
		docCategoryLower := strings.ToLower(doc.Category)

		// 1. Exact phrase match
		if strings.Contains(docContentLower, queryLower) || strings.Contains(docTitleLower, queryLower) {
			score += 20
		}

		// 2. Token-level matching
		for _, token := range tokens {
			if strings.Contains(docTitleLower, token) {
				score += 10
			}
			if strings.Contains(docKeywordsLower, token) {
				score += 8
			}
			if strings.Contains(docCategoryLower, token) {
				score += 5
			}
			// Content match frequency (capped at 5 matches)
			count := strings.Count(docContentLower, token)
			if count > 5 {
				count = 5
			}
			score += count * 3
		}

		if score > 0 {
			scoredDocs = append(scoredDocs, ScoredDocument{
				Doc:   doc,
				Score: score,
			})
		}
	}

	// Sort by score descending
	sort.Slice(scoredDocs, func(i, j int) bool {
		return scoredDocs[i].Score > scoredDocs[j].Score
	})

	var selectedDocs []models.KnowledgeDocument
	if len(scoredDocs) > 0 {
		limit := topK
		if len(scoredDocs) < limit {
			limit = len(scoredDocs)
		}
		for i := 0; i < limit; i++ {
			selectedDocs = append(selectedDocs, scoredDocs[i].Doc)
		}
	} else {
		// Fallback: Pick top general overview documents if no specific match
		limit := topK
		if len(allDocs) < limit {
			limit = len(allDocs)
		}
		selectedDocs = allDocs[:limit]
	}

	// Format into Markdown Context string for LLM Prompt injection
	var sb strings.Builder
	for i, doc := range selectedDocs {
		sb.WriteString(fmt.Sprintf("\n### [Dokumen %d: %s (Kategori: %s)]\n%s\n", i+1, doc.Title, doc.Category, doc.Content))
	}

	return selectedDocs, sb.String()
}
