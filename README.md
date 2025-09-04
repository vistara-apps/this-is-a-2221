# SampleFlow

**Clear Sample Rights, Faster. Focus on your music, not the paperwork.**

SampleFlow is a web application for remix artists to quickly identify sample sources, assess clearance risks, and streamline negotiations with rights holders.

## Features

### Sample Identification
Upload an audio file or provide a link to a track. The system analyzes the audio to identify the original source track and potential rights holders using AI and music metadata databases.

### Risk Assessment
Based on the identified sample and its original context, provides an estimated risk score for clearance difficulty and potential DMCA takedown issues.

### Negotiation Hub
A centralized dashboard to manage communications with rights holders. Includes templates for initial outreach, offer tracking, and documentation of clearance progress.

### Usage Documentation
Generates a record of all clearance activities, including communication logs, offers made, and approvals received, creating a verifiable trail for legal protection.

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **API Integration**: OpenAI, ElevenLabs, Stripe
- **Authentication**: JWT-based auth system
- **Data Storage**: Secure cloud storage for audio files and documents

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/sampleflow.git
   cd sampleflow
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   REACT_APP_STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. Start the development server:
   ```
   npm start
   # or
   yarn start
   ```

## Project Structure

```
src/
├── components/         # UI components
├── config/             # Configuration files
├── hooks/              # Custom React hooks
├── services/           # API service integrations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Business Model

SampleFlow uses a tiered subscription model:

- **Free tier**: Limited searches & core features
- **Pro tier ($29/mo)**: Advanced analytics, unlimited searches, and negotiation tools
- **Premium tier ($79/mo)**: Priority support and custom integrations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for audio analysis capabilities
- ElevenLabs for advanced audio processing
- Stripe for payment processing
- All the artists who inspired this project

