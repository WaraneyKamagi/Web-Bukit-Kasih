package dto

// ActivityDTO is used for incoming requests and outgoing responses
type ActivityDTO struct {
	ID          string   `json:"id" binding:"required"`
	Title       string   `json:"title" binding:"required"`
	Location    string   `json:"location"`
	Description string   `json:"description"`
	ImageURL    string   `json:"image"`
	Categories  []string `json:"categories"`
	Hours       string   `json:"hours"`
	Meta        string   `json:"meta"`
	IsFav       bool     `json:"isFav"`
	Difficulty  string   `json:"difficulty"`
	Tips        string   `json:"tips"`
}

type DestinationDTO struct {
	ID                uint   `json:"id"`
	Title             string `json:"title" binding:"required"`
	ImageURL          string `json:"image"`
	AltText           string `json:"altText"`
	DetailsTitle      string `json:"detailsTitle"`
	DetailsText       string `json:"detailsText"`
	DetailsTips       string `json:"detailsTips"`
	DetailsHours      string `json:"detailsHours"`
	DetailsDifficulty string `json:"detailsDifficulty"`
}
