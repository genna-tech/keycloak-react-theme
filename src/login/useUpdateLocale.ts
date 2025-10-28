import { I18n } from "keycloakify/login/i18n";
import { useEffect } from "react";

export function useUpdateLocale(i18n: I18n) {
    const { currentLanguage, enabledLanguages } = i18n;
    useEffect(() => {
        const currentLanguageTag = currentLanguage.languageTag;
        const selectedLanguage = enabledLanguages.find(l => l.languageTag === currentLanguageTag);
        const logContext = { currentLanguageTag, selectedLanguage };
        if (selectedLanguage?.href) {
          console.info("Forcing save user locale", logContext);
          fetch(selectedLanguage.href).then(() => {
            console.info("Saving user locale succeeded", logContext);
          }).catch((error) => {
            console.error("Saving user locale failed", { ...logContext, error });
          });
        } else {
          console.error("Language link unavailable", logContext);
        }
    }, []);
}
