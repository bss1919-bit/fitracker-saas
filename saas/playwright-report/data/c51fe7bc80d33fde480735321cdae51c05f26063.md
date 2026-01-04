# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]: FitTracker Pro
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: Welcome Back Coach
        - generic [ref=e8]: Enter your credentials to access your dashboard
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - generic [ref=e12]: Email
            - textbox "Email" [ref=e13]:
              - /placeholder: coach@example.com
          - generic [ref=e14]:
            - generic [ref=e15]: Password
            - textbox "Password" [ref=e16]
          - button "Sign In" [ref=e17]
        - link "Don't have an account? Register" [ref=e19]:
          - /url: /en/auth/register
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e25] [cursor=pointer]:
    - img [ref=e26]
  - alert [ref=e31]
```