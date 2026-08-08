# Uploads Directory

This directory stores uploaded files for the restaurant ERP system.

## Structure

- `menu-images/` - Menu item images uploaded by users
- `menu-files/` - Temporary storage for Excel import files

## Important Notes

1. **Automatic Cleanup**: Import files in `menu-files/` are automatically deleted after processing
2. **Image Storage**: Images in `menu-images/` are permanent and served via `/uploads/menu-images/{filename}`
3. **File Size Limits**:
   - Images: Maximum 5MB
   - Excel files: Maximum 10MB
4. **Allowed Formats**:
   - Images: JPEG, JPG, PNG, GIF, WebP
   - Import files: XLSX, XLS, CSV

## Security

- All upload endpoints require authentication
- File type validation is enforced
- Files are saved with unique names to prevent conflicts
- This directory should NOT be committed to version control (excluded in .gitignore)

## Backup

For production environments:
- Set up regular backups of the `menu-images/` directory
- Consider using cloud storage for production images
- Monitor disk space usage

## Development

For local development:
- These directories are created automatically by the upload middleware
- Sample images are not included in the repository
- Use the image upload feature to add test images
