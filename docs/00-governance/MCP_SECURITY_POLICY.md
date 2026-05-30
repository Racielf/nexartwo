# MCP_SECURITY_POLICY — NexArtWO

## Default policy

Deny by default. Allow only what is needed.

## Approved low-risk MCP use

- Read-only GitHub access
- Read-only local files
- Read-only documentation search
- Local test commands after approval

## Restricted MCP use

- Database write access
- Supabase admin actions
- Browser automation with financial accounts
- Shell commands that delete/move many files
- Access to production secrets

## Security rules

- Prefer read-only tokens.
- Use allowlists.
- Never expose `.env` secrets.
- Never give agents unrestricted database access.
- Log tool actions.
- Disconnect untrusted servers.
