package services

import (
	"strings"

	"bukit-kasih-backend/database"
	"bukit-kasih-backend/dto"
	"bukit-kasih-backend/models"
)

// --- MAPPERS ---

func MapActivityToDTO(a models.Activity) dto.ActivityDTO {
	categories := []string{}
	if a.Categories != "" {
		cats := strings.Split(a.Categories, ",")
		for _, c := range cats {
			categories = append(categories, strings.TrimSpace(c))
		}
	}
	return dto.ActivityDTO{
		ID:          a.ActivityID,
		Title:       a.Title,
		Location:    a.Location,
		Description: a.Description,
		ImageURL:    a.ImageURL,
		Categories:  categories,
		Hours:       a.Hours,
		Meta:        a.Meta,
		IsFav:       a.IsFav,
		Difficulty:  a.Difficulty,
		Tips:        a.Tips,
	}
}

func MapDTOToActivity(d dto.ActivityDTO) models.Activity {
	return models.Activity{
		ActivityID:  d.ID,
		Title:       d.Title,
		Location:    d.Location,
		Description: d.Description,
		ImageURL:    d.ImageURL,
		Categories:  strings.Join(d.Categories, ", "),
		Hours:       d.Hours,
		Meta:        d.Meta,
		IsFav:       d.IsFav,
		Difficulty:  d.Difficulty,
		Tips:        d.Tips,
	}
}

func MapDestinationToDTO(d models.Destination) dto.DestinationDTO {
	return dto.DestinationDTO{
		ID:                d.ID,
		Title:             d.Title,
		ImageURL:          d.ImageURL,
		AltText:           d.AltText,
		DetailsTitle:      d.DetailsTitle,
		DetailsText:       d.DetailsText,
		DetailsTips:       d.DetailsTips,
		DetailsHours:      d.DetailsHours,
		DetailsDifficulty: d.DetailsDifficulty,
	}
}

func MapDTOToDestination(d dto.DestinationDTO) models.Destination {
	return models.Destination{
		Title:             d.Title,
		ImageURL:          d.ImageURL,
		AltText:           d.AltText,
		DetailsTitle:      d.DetailsTitle,
		DetailsText:       d.DetailsText,
		DetailsTips:       d.DetailsTips,
		DetailsHours:      d.DetailsHours,
		DetailsDifficulty: d.DetailsDifficulty,
	}
}

// --- ACTIVITIES ---

func GetActivities() ([]dto.ActivityDTO, error) {
	var activities []models.Activity
	if err := database.DB.Find(&activities).Error; err != nil {
		return nil, err
	}
	
	var dtos []dto.ActivityDTO
	for _, a := range activities {
		dtos = append(dtos, MapActivityToDTO(a))
	}
	return dtos, nil
}

func CreateActivity(input dto.ActivityDTO) (dto.ActivityDTO, error) {
	activity := MapDTOToActivity(input)
	err := database.DB.Create(&activity).Error
	return MapActivityToDTO(activity), err
}

func UpdateActivity(id string, input dto.ActivityDTO) (dto.ActivityDTO, error) {
	var activity models.Activity
	// Note: using ID as primary key or ActivityID?
	// Frontend sends `id` string (e.g. "act1") which is ActivityID.
	if err := database.DB.Where("activity_id = ?", id).First(&activity).Error; err != nil {
		return dto.ActivityDTO{}, err
	}
	
	updated := MapDTOToActivity(input)
	updated.ID = activity.ID // preserve GORM primary key
	updated.CreatedAt = activity.CreatedAt
	
	if err := database.DB.Save(&updated).Error; err != nil {
		return dto.ActivityDTO{}, err
	}
	return MapActivityToDTO(updated), nil
}

func DeleteActivity(id string) error {
	return database.DB.Where("activity_id = ?", id).Delete(&models.Activity{}).Error
}

// --- DESTINATIONS ---

func GetDestinations() ([]dto.DestinationDTO, error) {
	var destinations []models.Destination
	if err := database.DB.Find(&destinations).Error; err != nil {
		return nil, err
	}
	
	var dtos []dto.DestinationDTO
	for _, d := range destinations {
		dtos = append(dtos, MapDestinationToDTO(d))
	}
	return dtos, nil
}

func CreateDestination(input dto.DestinationDTO) (dto.DestinationDTO, error) {
	dest := MapDTOToDestination(input)
	err := database.DB.Create(&dest).Error
	dest.ID = dest.ID // GORM updates the ID after create
	return MapDestinationToDTO(dest), err
}

func UpdateDestination(id string, input dto.DestinationDTO) (dto.DestinationDTO, error) {
	var dest models.Destination
	if err := database.DB.First(&dest, id).Error; err != nil {
		return dto.DestinationDTO{}, err
	}
	
	updated := MapDTOToDestination(input)
	updated.ID = dest.ID
	updated.CreatedAt = dest.CreatedAt
	
	if err := database.DB.Save(&updated).Error; err != nil {
		return dto.DestinationDTO{}, err
	}
	return MapDestinationToDTO(updated), nil
}

func DeleteDestination(id string) error {
	return database.DB.Delete(&models.Destination{}, id).Error
}
