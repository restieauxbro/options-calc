# Options Strategy Calculator

A modern web application for analyzing protective put and covered call strategies on stock positions. Calculate your effective losses, break-even prices, and visualize different outcome scenarios at options expiration.

![Options Strategy Calculator](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Options+Strategy+Calculator)

## Features

### 📊 Stock Position Management
- Track shares, purchase price, and current market price
- View initial investment, current value, and unrealized P/L
- Real-time calculations as you update values

### 🎯 Options Strategies

**Protective Put**
- Define strike price, premium, and expiration
- Protect your downside at a specific price level
- See total cost of protection

**Covered Call**
- Set strike price, premium, and expiration
- Generate income while capping upside
- View premium credit received

### 📈 Analysis & Insights

- **Position Summary**: Net options cost, total cost basis, and new break-even price
- **Outcome Scenarios**: Comprehensive table showing P/L at different stock prices
- **Key Insights**: Maximum loss/gain and protection levels
- **Visual Indicators**: Color-coded profit/loss displays

### 🎨 User Experience
- Clean, modern interface with dark mode support
- Responsive design for desktop and mobile
- Real-time calculations with no page reloads
- Toggle strategies on/off to compare scenarios

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/options-calc.git
cd options-calc
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Basic Example

Let's say you bought 300 shares of SOXL at $46.01, and it's now at $42.80:

1. **Enter your stock position:**
   - Shares: 300
   - Purchase Price: $46.01
   - Current Price: $42.80

2. **Add a protective put:**
   - Enable "Protective Put"
   - Strike Price: $46.00
   - Premium: $6.70
   - Days: 45

3. **View your analysis:**
   - See your new break-even price ($52.71)
   - View protection level (guaranteed exit at $46)
   - Analyze different price scenarios

### Advanced: Collar Strategy

Combine a protective put with a covered call to reduce the cost of protection:

1. Enable both "Protective Put" and "Covered Call"
2. Set your desired strike prices
3. Watch how the call premium offsets the put cost
4. Analyze capped upside vs. protected downside

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: React 19
- **Fonts**: Geist Sans & Geist Mono

## Project Structure

```
options-calc/
├── app/
│   ├── components/
│   │   └── OptionsCalculator.tsx  # Main calculator component
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── public/                        # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## Building for Production

```bash
npm run build
npm start
```

The production build will be optimized and ready for deployment.

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/options-calc)

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Railway
- Render

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Add visual profit/loss charts
- [ ] Support for multiple positions
- [ ] Greeks calculator (Delta, Gamma, Theta, Vega)
- [ ] Historical data integration
- [ ] Save/load position presets
- [ ] Export scenarios to CSV/PDF
- [ ] Options strategy comparisons
- [ ] Probability calculator

## Disclaimer

This tool is for educational and informational purposes only. It does not constitute financial advice. Options trading involves significant risk and is not suitable for all investors. Past performance is not indicative of future results. Always consult with a qualified financial advisor before making investment decisions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Inspired by the need for better options analysis tools

## Contact

Project Link: [https://github.com/yourusername/options-calc](https://github.com/yourusername/options-calc)

---

Made with ❤️ for options traders
