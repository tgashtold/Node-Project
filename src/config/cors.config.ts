import cors from "cors";

export const corsOptions: cors.CorsOptions = {
    origin: [
        `${process.env.FRONT_URL}`,
        'http://localhost:3000'
    ],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'x-access-token'],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    preflightContinue: false
};

