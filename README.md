## Building and Running

### Prerequisites

#### Packages

First you must install all necessary packages for the application:
```bash
npm i
```

If you plan on modifying and rebuilding the application, you must globally install **tsc** and **tsx**:
```bash
npm i -g tsc tsx
```

#### Database

This application requires an active postgresql database connection defined by the `DATABASE_URL` attribute in your env file.

### Building

To build the whole application:

```bash
npm run build
```

To build the server or client only, append `:server` or `:client` respectively.

### Running

To run the server and server the client at the defined `REACT_APP_ORIGIN`, run

```bash
npm run start
```