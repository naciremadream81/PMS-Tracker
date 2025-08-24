# Extra Stuff - Moved Files

This folder contains files that were moved during the cleanup of the PMS Tracker project. These files are no longer needed for the current functionality.

## Files Moved Here

### Root Level Files
- **`Design Document (Markdown) copy.txt`** - Old design document copy, no longer needed
- **`PMS-Tracker.tar.gz`** - Empty archive file, not needed
- **`test-login.html`** - Test file for login functionality, no longer needed
- **`test.txt`** - Test file, not needed
- **`env.template`** - Old environment template, replaced by `env.example`
- **`docker.sh`** - Old Docker script, replaced by setup scripts
- **`env.local`** - Local environment file, not needed in repo
- **`env.docker`** - Docker environment file, not needed in repo
- **`docker-compose.override.yml`** - Override file not needed for current setup

### Server Files
- **`test-password.js`** - Test script for password functionality, no longer needed
- **`sync-db.js`** - Old database sync script, replaced by Sequelize models
- **`reset-admin-password.js`** - Admin password reset script, no longer needed
- **`create-admin-direct.js`** - Direct admin creation script, no longer needed
- **`debug-login.js`** - Debug script for login, no longer needed
- **`env.example`** - Server environment example, redundant with root level

### Scripts
- **`seed.js`** - Old seeding script, replaced by `seed-all.js` and `seed-florida-counties.js`

### macOS System Files
- All `._*` files were removed (macOS resource fork files)

## Why These Files Were Moved

1. **Redundancy** - Multiple environment files and templates
2. **Outdated** - Old scripts and test files no longer needed
3. **Development artifacts** - Test files and debug scripts
4. **System files** - macOS resource fork files
5. **Archived content** - Old design documents and empty archives

## Current Project Structure

The cleaned project now has a clear structure:
- `client/` - React frontend application
- `server/` - Node.js backend API
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- `env.example` - Environment configuration template
- `setup-*.sh` - Automated setup scripts
- `README.md` - Project documentation

All essential functionality is preserved while removing clutter and outdated files.
