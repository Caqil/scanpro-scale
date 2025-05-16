package handlers

import (
	"net/http"

	"github.com/Caqil/megapdf-api/internal/models"
	"github.com/Caqil/megapdf-api/internal/services"
	"github.com/gin-gonic/gin"
)

// SessionHandler handles session-related HTTP requests
type SessionHandler struct {
	Service *services.SessionService
}

func NewSessionHandler(service *services.SessionService) *SessionHandler {
	return &SessionHandler{Service: service}
}

// CreateSession creates a new session
// @Summary Create a new session
// @Description Creates a new session with the provided details
// @Tags sessions
// @Accept json
// @Produce json
// @Param session body models.Session true "Session data"
// @Success 201 {object} models.Session
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sessions [post]
func (h *SessionHandler) CreateSession(c *gin.Context) {
	var session models.Session
	if err := c.ShouldBindJSON(&session); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.CreateSession(&session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, session)
}

// GetSession retrieves a session by ID
// @Summary Get a session
// @Description Retrieves a session by its ID
// @Tags sessions
// @Accept json
// @Produce json
// @Param id path string true "Session ID"
// @Success 200 {object} models.Session
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /sessions/{id} [get]
func (h *SessionHandler) GetSession(c *gin.Context) {
	id := c.Param("id")
	session, err := h.Service.GetSession(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}
	c.JSON(http.StatusOK, session)
}

// UpdateSession updates a session by ID
// @Summary Update a session
// @Description Updates a session with the provided details
// @Tags sessions
// @Accept json
// @Produce json
// @Param id path string true "Session ID"
// @Param session body models.Session true "Session data"
// @Success 200 {object} models.Session
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sessions/{id} [put]
func (h *SessionHandler) UpdateSession(c *gin.Context) {
	id := c.Param("id")
	var session models.Session
	if err := c.ShouldBindJSON(&session); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.Service.UpdateSession(id, &session); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, session)
}

// DeleteSession deletes a session by ID
// @Summary Delete a session
// @Description Deletes a session by its ID
// @Tags sessions
// @Accept json
// @Produce json
// @Param id path string true "Session ID"
// @Success 204
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /sessions/{id} [delete]
func (h *SessionHandler) DeleteSession(c *gin.Context) {
	id := c.Param("id")
	if err := h.Service.DeleteSession(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
