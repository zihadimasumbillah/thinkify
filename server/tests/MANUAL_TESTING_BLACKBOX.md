# 🧪 Thinkify Manual Testing Guide

## Black Box Testing

Black box testing focuses on inputs and outputs without knowledge of internal code structure.

---

## Table of Contents
1. [Functional Test Cases](#functional-test-cases)
2. [UI/UX Test Cases](#uiux-test-cases)
3. [Boundary Value Analysis](#boundary-value-analysis)
4. [Equivalence Partitioning](#equivalence-partitioning)
5. [Error Handling Tests](#error-handling-tests)
6. [Test Results Template](#test-results-template)

---

## Functional Test Cases

### BB-AUTH: Authentication Features

#### BB-AUTH-001: User Registration
| Field | Value |
|-------|-------|
| **Test ID** | BB-AUTH-001 |
| **Feature** | User Registration |
| **Priority** | High |
| **Precondition** | User not logged in, on /register page |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /register | Registration form displayed |
| 2 | Enter valid username: "newuser123" | Field accepts input |
| 3 | Enter valid email: "newuser@test.com" | Field accepts input |
| 4 | Enter valid password: "SecurePass123" | Password masked |
| 5 | Click "Register" button | Loading indicator shown |
| 6 | Wait for response | Redirected to home page |
| 7 | Check navbar | Shows username/avatar |

**Pass Criteria:** User successfully registered and logged in

---

#### BB-AUTH-002: User Login
| Field | Value |
|-------|-------|
| **Test ID** | BB-AUTH-002 |
| **Feature** | User Login |
| **Priority** | High |
| **Precondition** | User registered, on /login page |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /login | Login form displayed |
| 2 | Enter email: "demo@thinkify.com" | Field accepts input |
| 3 | Enter password: "demo123" | Password masked |
| 4 | Click "Login" button | Loading indicator shown |
| 5 | Wait for response | Redirected to home page |
| 6 | Refresh page | User remains logged in |

**Pass Criteria:** User logged in, session persists

---

#### BB-AUTH-003: User Logout
| Field | Value |
|-------|-------|
| **Test ID** | BB-AUTH-003 |
| **Feature** | User Logout |
| **Priority** | High |
| **Precondition** | User logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click user avatar/menu | Dropdown appears |
| 2 | Click "Logout" | Loading indicator |
| 3 | Wait for response | Redirected to /login |
| 4 | Try to access /create | Redirected to /login |

**Pass Criteria:** User logged out, protected routes inaccessible

---

#### BB-AUTH-004: Invalid Login Attempt
| Field | Value |
|-------|-------|
| **Test ID** | BB-AUTH-004 |
| **Feature** | Login Error Handling |
| **Priority** | High |
| **Precondition** | On /login page |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter email: "demo@thinkify.com" | Field accepts input |
| 2 | Enter wrong password: "wrongpass" | Field accepts input |
| 3 | Click "Login" button | Loading indicator |
| 4 | Wait for response | Error message displayed |
| 5 | Check error message | "Invalid credentials" shown |

**Pass Criteria:** Clear error message, user not logged in

---

#### BB-AUTH-005: Registration with Existing Email
| Field | Value |
|-------|-------|
| **Test ID** | BB-AUTH-005 |
| **Feature** | Duplicate Email Prevention |
| **Priority** | Medium |
| **Precondition** | User with demo@thinkify.com exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /register | Registration form displayed |
| 2 | Enter username: "anotheruser" | Field accepts input |
| 3 | Enter email: "demo@thinkify.com" | Field accepts input |
| 4 | Enter password: "ValidPass123" | Field accepts input |
| 5 | Click "Register" | Error message displayed |
| 6 | Check error | "Email already exists" |

**Pass Criteria:** Registration blocked, helpful error shown

---

### BB-POST: Post Features

#### BB-POST-001: Create New Post
| Field | Value |
|-------|-------|
| **Test ID** | BB-POST-001 |
| **Feature** | Post Creation |
| **Priority** | High |
| **Precondition** | User logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Create Post" button | Navigate to /create |
| 2 | Enter title: "My First Post" | Field accepts input |
| 3 | Select category: "Technology" | Category selected |
| 4 | Enter content (100+ chars) | Content area accepts input |
| 5 | Add tags: "test, first" | Tags displayed |
| 6 | Click "Publish" | Loading indicator |
| 7 | Wait for response | Redirected to post page |
| 8 | Verify post content | Title, content displayed |

**Pass Criteria:** Post created and visible

---

#### BB-POST-002: View Post Details
| Field | Value |
|-------|-------|
| **Test ID** | BB-POST-002 |
| **Feature** | Post View |
| **Priority** | High |
| **Precondition** | Posts exist in database |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to home page | Post list displayed |
| 2 | Click on a post card | Navigate to /post/:id |
| 3 | Verify post title | Title displayed correctly |
| 4 | Verify author info | Avatar, name, date shown |
| 5 | Verify content | Full content displayed |
| 6 | Verify comments section | Comments area visible |

**Pass Criteria:** All post details displayed correctly

---

#### BB-POST-003: Like/Unlike Post
| Field | Value |
|-------|-------|
| **Test ID** | BB-POST-003 |
| **Feature** | Post Likes |
| **Priority** | Medium |
| **Precondition** | User logged in, viewing a post |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note current like count | e.g., "5 likes" |
| 2 | Click heart/like button | Button animates |
| 3 | Verify like count | Increased by 1 |
| 4 | Verify button state | Filled/active state |
| 5 | Click like button again | Button animates |
| 6 | Verify like count | Decreased by 1 |
| 7 | Verify button state | Unfilled/inactive state |

**Pass Criteria:** Like toggles correctly with animation

---

#### BB-POST-004: Edit Own Post
| Field | Value |
|-------|-------|
| **Test ID** | BB-POST-004 |
| **Feature** | Post Editing |
| **Priority** | High |
| **Precondition** | User logged in, viewing own post |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Edit" button | Edit form appears |
| 2 | Modify title | Field updates |
| 3 | Modify content | Content updates |
| 4 | Click "Update" | Loading indicator |
| 5 | Wait for response | Success message |
| 6 | Verify changes | Updated content shown |

**Pass Criteria:** Post updated successfully

---

#### BB-POST-005: Delete Own Post
| Field | Value |
|-------|-------|
| **Test ID** | BB-POST-005 |
| **Feature** | Post Deletion |
| **Priority** | High |
| **Precondition** | User logged in, viewing own post |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Delete" button | Confirmation modal |
| 2 | Click "Cancel" | Modal closes |
| 3 | Click "Delete" again | Confirmation modal |
| 4 | Click "Confirm Delete" | Loading indicator |
| 5 | Wait for response | Redirected to home |
| 6 | Search for post | Post not found |

**Pass Criteria:** Post deleted permanently

---

### BB-COMMENT: Comment Features

#### BB-COMMENT-001: Add Comment
| Field | Value |
|-------|-------|
| **Test ID** | BB-COMMENT-001 |
| **Feature** | Comment Creation |
| **Priority** | High |
| **Precondition** | User logged in, viewing a post |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll to comments section | Comment form visible |
| 2 | Enter comment text | Text appears in field |
| 3 | Click "Submit" | Loading indicator |
| 4 | Wait for response | Comment appears in list |
| 5 | Verify comment | Shows user, time, content |

**Pass Criteria:** Comment added and displayed

---

#### BB-COMMENT-002: Reply to Comment
| Field | Value |
|-------|-------|
| **Test ID** | BB-COMMENT-002 |
| **Feature** | Nested Comments |
| **Priority** | Medium |
| **Precondition** | User logged in, comment exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Reply" on comment | Reply form expands |
| 2 | Enter reply text | Text appears |
| 3 | Click "Submit Reply" | Loading indicator |
| 4 | Wait for response | Reply appears nested |
| 5 | Verify nesting | Reply indented under parent |

**Pass Criteria:** Reply nested correctly

---

### BB-USER: User Profile Features

#### BB-USER-001: View Profile
| Field | Value |
|-------|-------|
| **Test ID** | BB-USER-001 |
| **Feature** | User Profile |
| **Priority** | Medium |
| **Precondition** | User exists |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click on username | Navigate to /profile/:id |
| 2 | Verify avatar | User avatar displayed |
| 3 | Verify display name | Name shown |
| 4 | Verify bio | Bio text displayed |
| 5 | Verify stats | Followers, following count |
| 6 | Verify posts | User's posts listed |

**Pass Criteria:** All profile info displayed

---

#### BB-USER-002: Edit Profile
| Field | Value |
|-------|-------|
| **Test ID** | BB-USER-002 |
| **Feature** | Profile Editing |
| **Priority** | Medium |
| **Precondition** | User logged in |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /settings | Settings page displayed |
| 2 | Update display name | Field accepts input |
| 3 | Update bio | Field accepts input |
| 4 | Click "Save Changes" | Loading indicator |
| 5 | Navigate to profile | Changes reflected |

**Pass Criteria:** Profile updated successfully

---

#### BB-USER-003: Follow/Unfollow User
| Field | Value |
|-------|-------|
| **Test ID** | BB-USER-003 |
| **Feature** | Follow System |
| **Priority** | Medium |
| **Precondition** | User logged in, viewing another user's profile |

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note follower count | e.g., "100 followers" |
| 2 | Click "Follow" button | Button changes to "Following" |
| 3 | Verify follower count | Increased by 1 |
| 4 | Click "Following" button | Button changes to "Follow" |
| 5 | Verify follower count | Decreased by 1 |

**Pass Criteria:** Follow/unfollow works correctly

---

## Boundary Value Analysis

### BVA-001: Username Length
| Boundary | Value | Expected |
|----------|-------|----------|
| Below Min | 2 chars | ❌ Rejected |
| At Min | 3 chars | ✅ Accepted |
| Above Min | 4 chars | ✅ Accepted |
| At Max | 30 chars | ✅ Accepted |
| Above Max | 31 chars | ❌ Rejected |

### BVA-002: Password Length
| Boundary | Value | Expected |
|----------|-------|----------|
| Below Min | 5 chars | ❌ Rejected |
| At Min | 6 chars | ✅ Accepted |
| Above Min | 7 chars | ✅ Accepted |
| Normal | 12 chars | ✅ Accepted |

### BVA-003: Post Title Length
| Boundary | Value | Expected |
|----------|-------|----------|
| Below Min | 4 chars | ❌ Rejected |
| At Min | 5 chars | ✅ Accepted |
| Normal | 50 chars | ✅ Accepted |
| At Max | 200 chars | ✅ Accepted |
| Above Max | 201 chars | ❌ Rejected |

### BVA-004: Post Content Length
| Boundary | Value | Expected |
|----------|-------|----------|
| Below Min | 19 chars | ❌ Rejected |
| At Min | 20 chars | ✅ Accepted |
| Normal | 500 chars | ✅ Accepted |
| Large | 5000 chars | ✅ Accepted |

---

## Equivalence Partitioning

### EP-001: Email Input
| Partition | Example | Expected |
|-----------|---------|----------|
| Valid email | user@domain.com | ✅ Accepted |
| Missing @ | userdomain.com | ❌ Rejected |
| Missing domain | user@ | ❌ Rejected |
| Missing user | @domain.com | ❌ Rejected |
| Multiple @ | user@@domain.com | ❌ Rejected |
| Special chars | user+tag@domain.com | ✅ Accepted |

### EP-002: Password Input
| Partition | Example | Expected |
|-----------|---------|----------|
| Valid (6+ chars) | password123 | ✅ Accepted |
| Too short | pass | ❌ Rejected |
| Empty | (empty) | ❌ Rejected |
| With spaces | pass word | ✅ Accepted |
| Special chars | p@ss!word | ✅ Accepted |

### EP-003: Username Input
| Partition | Example | Expected |
|-----------|---------|----------|
| Alphanumeric | user123 | ✅ Accepted |
| With underscore | user_123 | ✅ Accepted |
| With hyphen | user-123 | ❌ Rejected |
| With spaces | user 123 | ❌ Rejected |
| Special chars | user@123 | ❌ Rejected |
| Numbers only | 12345 | ✅ Accepted |

---

## Error Handling Tests

### ERR-001: Network Error
| Step | Action | Expected |
|------|--------|----------|
| 1 | Disconnect network | |
| 2 | Try to submit form | Loading indicator |
| 3 | Wait for timeout | Error toast appears |
| 4 | Check message | "Network error" or similar |
| 5 | Reconnect network | App recovers |

### ERR-002: 404 Page
| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to /nonexistent | 404 page displayed |
| 2 | Check content | Friendly error message |
| 3 | Check "Go Home" link | Works correctly |

### ERR-003: Server Error
| Step | Action | Expected |
|------|--------|----------|
| 1 | Trigger 500 error | Error handled gracefully |
| 2 | Check UI | Error message displayed |
| 3 | Check functionality | App doesn't crash |

---

## UI/UX Test Cases

### UI-001: Responsive Design - Mobile
| Screen | Width | Test |
|--------|-------|------|
| iPhone SE | 375px | Layout adapts, no horizontal scroll |
| iPhone 12 | 390px | All elements accessible |
| Android | 360px | Touch targets adequate size |

### UI-002: Responsive Design - Tablet
| Screen | Width | Test |
|--------|-------|------|
| iPad Mini | 768px | Two-column layout |
| iPad Pro | 1024px | Sidebar visible |

### UI-003: Dark Theme Elements
| Element | Check |
|---------|-------|
| Background | #121212 (charcoal) |
| Cards | #1a1a1a (surface) |
| Accent | #4ADE80 (neon green) |
| Text | #E5E5E5 (readable) |
| Contrast | WCAG AA compliant |

### UI-004: Animations
| Animation | Check |
|-----------|-------|
| Page transitions | Smooth, not jarring |
| Button hovers | Neon glow effect |
| Loading states | Skeleton or spinner |
| Toast notifications | Slide in/out |

---

## Test Results Template

```markdown
## Test Execution Report

**Date:** _______________
**Tester:** _______________
**Environment:** _______________
**Browser:** _______________

### Summary
| Status | Count |
|--------|-------|
| ✅ Pass | |
| ❌ Fail | |
| ⏭️ Skip | |
| **Total** | |

### Detailed Results

| Test ID | Status | Notes |
|---------|--------|-------|
| BB-AUTH-001 | | |
| BB-AUTH-002 | | |
| BB-AUTH-003 | | |
| ... | | |

### Defects Found
| ID | Test Case | Severity | Description |
|----|-----------|----------|-------------|
| | | | |

### Sign-off
- [ ] All critical tests pass
- [ ] No high-severity defects open
- [ ] Ready for release
```

---

## Quick Reference: Test Credentials

```
Demo User:     demo@thinkify.com / demo123
Test User 1:   alex@example.com / Password123!
Test User 2:   sarah@example.com / Password123!
```

---

## API Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@thinkify.com","password":"demo123"}' \
  -c cookies.txt
```

### Get Posts
```bash
curl http://localhost:5000/api/posts \
  -b cookies.txt
```

### Create Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Post",
    "content": "This is test content that is long enough.",
    "category": "CATEGORY_ID_HERE"
  }'
```

### Like Post
```bash
curl -X POST http://localhost:5000/api/posts/POST_ID/like \
  -b cookies.txt
```
