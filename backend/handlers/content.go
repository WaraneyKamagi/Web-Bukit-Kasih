package handlers

import (
	"net/http"
	"bukit-kasih-backend/dto"
	"bukit-kasih-backend/services"
	"github.com/gin-gonic/gin"
)

// --- ACTIVITIES ---

func GetActivities(c *gin.Context) {
	activities, err := services.GetActivities()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch activities"})
		return
	}
	c.JSON(http.StatusOK, activities)
}

func CreateActivity(c *gin.Context) {
	var input dto.ActivityDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data aktivitas tidak valid. Pastikan semua field wajib terisi dengan benar."})
		return
	}
	
	created, err := services.CreateActivity(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create activity"})
		return
	}
	c.JSON(http.StatusCreated, created)
}

func UpdateActivity(c *gin.Context) {
	id := c.Param("id")
	var input dto.ActivityDTO
	
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data aktivitas tidak valid. Pastikan semua field wajib terisi dengan benar."})
		return
	}
	
	updated, err := services.UpdateActivity(id, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update activity or not found"})
		return
	}
	c.JSON(http.StatusOK, updated)
}

func DeleteActivity(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteActivity(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete activity"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Activity deleted successfully"})
}

// --- DESTINATIONS ---

func GetDestinations(c *gin.Context) {
	destinations, err := services.GetDestinations()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch destinations"})
		return
	}
	c.JSON(http.StatusOK, destinations)
}

func CreateDestination(c *gin.Context) {
	var input dto.DestinationDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data destinasi tidak valid. Pastikan semua field wajib terisi dengan benar."})
		return
	}
	
	created, err := services.CreateDestination(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create destination"})
		return
	}
	c.JSON(http.StatusCreated, created)
}

func UpdateDestination(c *gin.Context) {
	id := c.Param("id")
	var input dto.DestinationDTO
	
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data destinasi tidak valid. Pastikan semua field wajib terisi dengan benar."})
		return
	}
	
	updated, err := services.UpdateDestination(id, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update destination or not found"})
		return
	}
	c.JSON(http.StatusOK, updated)
}

func DeleteDestination(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteDestination(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete destination"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Destination deleted successfully"})
}
