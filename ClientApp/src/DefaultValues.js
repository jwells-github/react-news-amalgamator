export class DefaultValues {
    static providers = {
        THE_GUARDIAN: { id: 1, name: "The Guardian", display: true },
        BBC_NEWS: { id: 2, name: "BBC News", display: true },
        DAILY_MAIL: { id: 3, name: "Daily Mail Online", display: true },
        THE_TELEGRAPH: { id: 4, name: "The Telegraph", display: true }
    }
    static preferredProvider = 0; // 0 = No preference, otherwise a provider id
}