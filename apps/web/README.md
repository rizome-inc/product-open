This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## UI Customization
- Mui Theme:
  - Main theme is controlled from `src/styles/theme.tsx`
  - Global component styles are applied using `styleOverrides` or `defaultProps` for each component in the theme.
  ```ts
	MuiButton: {
		defaultProps: {
			disableElevation: true,
		},
		styleOverrides: {
			outlined: {
				color: "primary",
				borderWidth: 2,
				fontSize: 14,
				fontStyle: "normal",
				fontWeight: 400,
				lineHeight: "21px",
				"&:hover": {
					borderWidth: 2,
				},
			},
		},
	},
  ```
  - Theme builder (note, as of this time only supports v4 of Mui): https://bareynol.github.io/mui-theme-creator
- Inline customization:
  - For the most part, component-level customizations are handled using the Mui `sx={...}` prop value ([Docs](https://mui.com/system/getting-started/the-sx-prop/)).
  - To override `sx` defaults provided by the theme, try:
  ```ts
  <Button
	sx={(theme) => ({
		...(theme.components?.MuiButton || {}),
		color: "red",
	})}
  />
  ```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
