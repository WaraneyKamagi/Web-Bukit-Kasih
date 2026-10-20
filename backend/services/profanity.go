package services

import (
	"regexp"
	"strings"
)

// Daftar pola kata kasar, SARA, dan spam dengan batas kata (word boundary \b)
// untuk mencegah false positive pada kata-kata umum (seperti "pantai", "bukan", "kasih").
var profanityPatterns = []*regexp.Regexp{
	// Kata kasar bahasa Indonesia umum
	regexp.MustCompile(`(?i)\b(anjing|babi|bangsat|kontol|memek|jembut|tai|kampret|goblok|tolol|idiot|asu|perek|lonte|bajingan)\b`),
	// Kata kasar bahasa Inggris umum
	regexp.MustCompile(`(?i)\b(fuck|shit|asshole|bitch|bastard|dick|pussy|cunt|slut)\b`),
	// Pola spam / judi / link mencurigakan
	regexp.MustCompile(`(?i)\b(slot\s*gacor|judi\s*online|togel|porn|viagra)\b`),
}

// CheckProfanity memeriksa apakah teks ulasan mengandung kata-kata yang melanggar norma.
// Mengembalikan (isProfane, detectedWord)
func CheckProfanity(text string) (bool, string) {
	trimmed := strings.TrimSpace(text)
	if trimmed == "" {
		return false, ""
	}

	for _, pattern := range profanityPatterns {
		if loc := pattern.FindString(trimmed); loc != "" {
			return true, loc
		}
	}

	return false, ""
}
