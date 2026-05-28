# SimulaCert

## Documentation languages

- 🇧🇷 Português: see [README.md](./README.md)
- 🇺🇸 English (this file)

SimulaCert is a **100% free platform** for practice exams ("simulados") for technology certifications, such as AWS, Azure, and Google Cloud. Our mission is to help professionals prepare for certification exams with realistic practice tests, detailed explanations, and performance analysis tools.

> Try it now: [Visit SimulaCert](https://simulacert.com)

![Screenshot of the SimulaCert platform](./public/screenshot.png)

## Feature highlights

- **Up-to-date practice exams**: Questions formatted like real exams.
- **Detailed explanations**: Understand each answer with clear explanations.
- **Performance statistics**: Track your progress and identify areas for improvement.
- **Accessibility**: Responsive and inclusive interface.
- **Internationalization**: Support for multiple languages.
- **Free**: All essential features are available at no cost.

## API Documentation

API documentation is available at [docs/api](https://tinyurl.com/2s4kp83e).

## Running locally (development)

Prerequisites: Node.js (LTS recommended) and npm.

```bash
npm install
npm run start
```

Other useful commands:

```bash
npm test
npm run build
```

### Mockoon
To test the API locally, we recommend using [Mockoon](https://mockoon.com/). It allows you to create and manage mock APIs easily and quickly, ideal for development and testing.
Use the `mockoon.json` file to import the API endpoints.

## Internationalization (i18n)
The app is currently available in English and Portuguese. To add more languages, follow these steps:
1. Create a new JSON file in the `src/assets/i18n` directory (e.g., `es.json` for Spanish).
2. Add the translated key-value pairs to the new JSON file.
3. Update the personalization component to add the new language option.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to help develop SimulaCert.

## License

This project is under a proprietary license. See the [LICENSE](./LICENSE) file for more details.

## Contact

- **Website**: [simulacert.com](https://simulacert.com)
- **Email**: marcelofeliciano@tutamail.com

Last updated: 2026-05-15
