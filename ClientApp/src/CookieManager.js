import { DefaultValues } from "./DefaultValues"

export class CookieManager {
    static darkModeCookieName = "darkmode"
    static preferredProviderCookieName = "preferedProvider"

    static getProvidersFromCookie(providers) {
        Object.keys(providers).forEach(key => {
            let cookieExistsForProvider = document.cookie.split(';').some((item) => item.trim().startsWith(key + '='))
            if (cookieExistsForProvider) {
                providers[key].display = document.cookie.split(';').some((item) => item.includes(key + '=true'))
            }
        })
        return providers
    }

    static getDarkModeFromCookie() {
        return document.cookie.split(';').some((item) => item.includes(CookieManager.darkModeCookieName + '=true'))
    }

    static getPreferredProviderFromCookie() {
        let preferedProviderCookieExists = document.cookie.split(';').some((item) => item.trim().startsWith(CookieManager.preferredProviderCookieName + '='))
        return preferedProviderCookieExists ? document.cookie.split('; ').find(row => row.startsWith(CookieManager.preferredProviderCookieName + '=')).split('=')[1] : DefaultValues.defaultPreferredProvider;
    }
}
