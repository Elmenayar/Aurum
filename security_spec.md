# Security Specification - AURUM Real Estate

## Data Invariants
1. **Brokers**: Every authenticated broker must have a document in `/brokers/` where the ID matches their UID. Access to leads is strictly tied to this identity.
2. **Leads**: Each lead MUST belong to exactly one broker. A broker can only see leads where `resource.data.brokerId == request.auth.uid`.
3. **Inquiries**: Publicly submittable but strictly admin-readable.
4. **Site Content**: Publicly readable for frontend rendering, but strictly admin-writable for CMS functionality.
5. **Activity Logs**: Write-only for brokers (to record progress), but they cannot be edited or deleted once written.

## The "Dirty Dozen" Payloads (Red Team Tests)

### 1. Lead Spoofing (Identity Bypass)
*   **Action**: Create Lead
*   **Payload**: `{ name: "John Doe", brokerId: "STOLEN_UID", status: "interested" }`
*   **Expected**: `PERMISSION_DENIED` - User can only create leads for themselves.

### 2. Status Escalation (Unauthorized State Change)
*   **Action**: Update Broker
*   **Payload**: `{ status: "VIP" }` (from a user whose current status is "New")
*   **Expected**: `PERMISSION_DENIED` - Brokers cannot change their own status.

### 3. Ghost Lead (Schema Violation)
*   **Action**: Create Lead
*   **Payload**: `{ name: "Incomplete" }` (Missing `phone`, `projectId`)
*   **Expected**: `PERMISSION_DENIED` - Fails `isValidLead` validation.

### 4. Log Erasure (Evidence Tampering)
*   **Action**: Delete ActivityLog
*   **Path**: `/activity_logs/log123`
*   **Expected**: `PERMISSION_DENIED` - Logs are immutable once written.

### 5. Private Inquiry Leak (PII Leak)
*   **Action**: Get Inquiry
*   **Path**: `/inquiries/target_inquiry` (by a non-admin user)
*   **Expected**: `PERMISSION_DENIED` - Inquiries are admin-only.

### 6. Content Defacement (CMS Vandalism)
*   **Action**: Update SiteContent
*   **Payload**: `{ value: "HACKED" }` (by non-admin)
*   **Expected**: `PERMISSION_DENIED` - Only admins can edit site content.

### 7. Config Injection (Privilege Escalation)
*   **Action**: Update AppConfig
*   **Payload**: `{ adminEmail: "hacker@evil.com" }`
*   **Expected**: `PERMISSION_DENIED` - Config is admin-writable.

### 8. Broker Profile Hijack (Identity Theft)
*   **Action**: Update Broker
*   **Path**: `/brokers/other_user_id`
*   **Expected**: `PERMISSION_DENIED` - Users can only manage their own profile.

### 9. Resource Exhaustion (Denial of Wallet)
*   **Action**: Create Inquiry
*   **Payload**: `{ message: "A".repeat(1000000) }` (1MB string)
*   **Expected**: `PERMISSION_DENIED` - Fails `.size()` limit checks.

### 10. ID Poisoning (Path Attack)
*   **Action**: Create Lead
*   **Path**: `/leads/MALICIOUS_LONG_ID_1.5KB...`
*   **Expected**: `PERMISSION_DENIED` - Fails `isValidId(leadId)` check.

### 11. Time Manipulation (Temporal Guard)
*   **Action**: Create Lead
*   **Payload**: `{ createdAt: "2099-01-01T00:00:00Z" }` (Future date)
*   **Expected**: `PERMISSION_DENIED` - `createdAt` must match `request.time`.

### 12. Cross-Broker Lead Access (List Query Enforcer)
*   **Action**: List Leads
*   **Query**: `db.collection('leads')` (without where clause)
*   **Expected**: `PERMISSION_DENIED` - Rules must enforce `resource.data.brokerId == request.auth.uid`.
