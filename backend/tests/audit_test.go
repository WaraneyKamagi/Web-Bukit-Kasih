package tests

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"bukit-kasih-backend/services"
)

func TestSecurityAuditLogging(t *testing.T) {
	testEmail := "audit_test_user@example.com"
	testIP := "192.168.1.100"
	testUA := "SecurityAuditTestClient/1.0"

	// 1. Test Auth Success Log
	services.LogAuthSuccess(testEmail, "Wisatawan", testIP, testUA)

	// 2. Test Auth Failure Log
	services.LogAuthFailure(testEmail, testIP, testUA, "Password mismatch")

	// 3. Test Admin Action Log
	services.LogAdminAction("admin@bukitkasih.com", "DELETE_TEST_DATA", "Item #99", testIP)

	// 4. Test Security Warning
	services.LogSecurityWarning("SUSPICIOUS_PATH_ACCESS", testIP, "Attempted /phpmyadmin")

	// Verify log file existence and content
	logFile := filepath.Join("logs", "security_audit.log")
	data, err := os.ReadFile(logFile)
	if err != nil {
		t.Fatalf("Failed to read audit log file %s: %v", logFile, err)
	}

	content := string(data)
	if !strings.Contains(content, testEmail) {
		t.Errorf("Expected audit log to contain test user email: %s", testEmail)
	}
	if !strings.Contains(content, "AUDIT_AUTH_SUCCESS") {
		t.Errorf("Expected audit log to contain 'AUDIT_AUTH_SUCCESS'")
	}
	if !strings.Contains(content, "SECURITY_WARNING_AUTH_FAIL") {
		t.Errorf("Expected audit log to contain 'SECURITY_WARNING_AUTH_FAIL'")
	}
	if !strings.Contains(content, "AUDIT_ADMIN_ACTION") {
		t.Errorf("Expected audit log to contain 'AUDIT_ADMIN_ACTION'")
	}
}
