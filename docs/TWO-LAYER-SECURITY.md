# Two-layer access protection

The published dashboard is encrypted during GitHub Actions deployment.

## Layers

1. `PLATFORM_PASSWORD` decrypts the root page and the legacy dashboard.
2. `PRIVATE_TABS_PASSWORD` separately decrypts these approved internal tabs:
   - `operational-plan`
   - `work-tracker`
   - `committees`

The two values must be different and at least 12 characters long. They are read only from GitHub Actions Secrets and must never be committed to the repository.

The previous browser-local privacy configuration is disabled in the encrypted publication. Visitors cannot change or clear the centrally defined protected-tab list.

## Rotation

Change either Actions secret and rerun the Pages workflow. The next successful deployment is encrypted with the new value.

## Limits

GitHub Pages remains a static public host. This design encrypts the generated HTML and prevents casual access to the dashboard and protected sections. It is not a substitute for identity-based access control, per-user audit logs, revocation, or multi-factor authentication. Those require an authenticated hosting layer.
