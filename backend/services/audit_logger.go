package services

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
)

var (
	auditFileMutex sync.Mutex
	auditLogPath   = filepath.Join("logs", "security_audit.log")
)

// writeToAuditLog writes a line to both the standard logger and logs/security_audit.log
func writeToAuditLog(prefix, message string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	formatted := fmt.Sprintf("[%s] %s | %s", prefix, timestamp, message)

	// Output to stdout/standard logger
	log.Println(formatted)

	// Append to file
	auditFileMutex.Lock()
	defer auditFileMutex.Unlock()

	// Ensure logs directory exists
	dir := filepath.Dir(auditLogPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return
	}

	f, err := os.OpenFile(auditLogPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0640)
	if err != nil {
		return
	}
	defer f.Close()

	_, _ = f.WriteString(formatted + "\n")
}

// LogAuthSuccess logs successful user logins (OWASP G1)
func LogAuthSuccess(email, role, ip, userAgent string) {
	msg := fmt.Sprintf("User: %s | Role: %s | IP: %s | UA: %s", email, role, ip, userAgent)
	writeToAuditLog("AUDIT_AUTH_SUCCESS", msg)
}

// LogAuthFailure logs failed login attempts (OWASP G1, G2)
func LogAuthFailure(email, ip, userAgent, reason string) {
	msg := fmt.Sprintf("Email: %s | IP: %s | Reason: %s | UA: %s", email, ip, reason, userAgent)
	writeToAuditLog("SECURITY_WARNING_AUTH_FAIL", msg)
}

// LogAdminAction logs sensitive administrative changes (OWASP G1, G3)
func LogAdminAction(adminEmail, action, target, ip string) {
	msg := fmt.Sprintf("Admin: %s | Action: %s | Target: %s | IP: %s", adminEmail, action, target, ip)
	writeToAuditLog("AUDIT_ADMIN_ACTION", msg)
}

// LogSecurityWarning logs suspicious or restricted security events (OWASP G2)
func LogSecurityWarning(event, ip, details string) {
	msg := fmt.Sprintf("Event: %s | IP: %s | Details: %s", event, ip, details)
	writeToAuditLog("SECURITY_WARNING", msg)
}
