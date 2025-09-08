import { useEffect, useState } from "react";
import type { LazyOrNot } from "keycloakify/tools/LazyOrNot";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import { clsx } from "keycloakify/tools/clsx";
import type { UserProfileFormFieldsProps } from "keycloakify/login/UserProfileFormFieldsProps";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import useProviderLogos from "../useProviderLogos";
import { createPortal } from "react-dom";

type RegisterProps = PageProps<Extract<KcContext, { pageId: "register.ftl" }>, I18n> & {
    UserProfileFormFields: LazyOrNot<(props: UserProfileFormFieldsProps) => JSX.Element>;
    doMakeUserConfirmPassword: boolean;
};

export default function Register(props: RegisterProps) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes, UserProfileFormFields, doMakeUserConfirmPassword } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const {
        messageHeader,
        url,
        messagesPerField,
        recaptchaRequired,
        recaptchaVisible,
        recaptchaSiteKey,
        recaptchaAction,
        termsAcceptanceRequired,
        social
    } = kcContext;

    const { msg, msgStr, advancedMsg, advancedMsgStr, currentLanguage, enabledLanguages } = i18n;

    const [isFormSubmittable, setIsFormSubmittable] = useState(false);
    const [areTermsAccepted, setAreTermsAccepted] = useState(false);

    const providerLogos = useProviderLogos();

    const showSocialProvidersOnRegister =
        (
            (advancedMsgStr("showSocialProvidersOnRegister") !== "showSocialProvidersOnRegister"
                ? advancedMsgStr("showSocialProvidersOnRegister")
                : null) || kcContext.properties.TAILCLOAKIFY_SHOW_SOCIAL_PROVIDERS_ON_REGISTER
        ).toUpperCase() === "TRUE";

    useEffect(() => {
        const languageHref = enabledLanguages.find(l => l.languageTag === currentLanguage.languageTag)?.href;
        if (languageHref) fetch(languageHref);
    }, []);

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={messageHeader !== undefined ? advancedMsg(messageHeader) : msg("registerTitle")}
            displayMessage={messagesPerField.exists("global")}
            displayRequiredFields={true}
            showBackToLogin={true}
            socialProvidersNode={
                <>
                    {showSocialProvidersOnRegister && social?.providers?.length && (
                        <div id="kc-social-providers" className={kcClsx("kcFormSocialAccountSectionClass")}>
                            <hr />
                            <h2 className={"pt-4 separate text-secondary-600 text-sm"}>{msg("identity-provider-login-label")}</h2>
                            <ul
                                className={clsx(
                                    kcClsx("kcFormSocialAccountListClass", social.providers.length > 3 && "kcFormSocialAccountListGridClass"),
                                    "gap-4 grid pt-4",
                                    social.providers.length === 1
                                        ? "grid-cols-1"
                                        : social.providers.length % 3 === 0 && social.providers.length <= 6
                                          ? "grid-cols-3"
                                          : social.providers.length % 2 === 0 && social.providers.length <= 6
                                            ? "grid-cols-2"
                                            : "grid-cols-4"
                                )}
                            >
                                {social.providers.map((...[p, , providers]) => (
                                    <li key={p.alias}>
                                        <a
                                            id={`social-${p.alias}`}
                                            className={clsx(
                                                kcClsx("kcFormSocialAccountListButtonClass", providers.length > 3 && "kcFormSocialAccountGridItem"),
                                                `border border-secondary-200 flex justify-center py-2 rounded-lg hover:border-opacity-30 hover:bg-provider-${p.alias}/10`
                                            )}
                                            style={{ textDecoration: "none" }}
                                            type="button"
                                            href={p.loginUrl}
                                        >
                                            {providerLogos[p.alias] ? (
                                                <div className={"h-6 w-6"}>
                                                    <img src={providerLogos[p.alias]} alt={`${p.displayName} logo`} className={"h-full w-auto"} />
                                                </div>
                                            ) : // Fallback to the original iconClasses if the logo is not defined
                                            p.iconClasses ? (
                                                <div className={"h-6 w-6"}>
                                                    <i
                                                        className={clsx(kcClsx("kcCommonLogoIdP"), p.iconClasses, `text-provider-${p.alias}`)}
                                                        aria-hidden="true"
                                                    ></i>
                                                </div>
                                            ) : (
                                                <div className="h-6 mx-1 pt-1 font-bold">{p.displayName || p.alias}</div>
                                            )}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            }
        >
            <form id="kc-register-form" className={kcClsx("kcFormClass")} action={url.registrationAction} method="post">
                <UserProfileFormFields
                    kcContext={kcContext}
                    i18n={i18n}
                    kcClsx={kcClsx}
                    onIsFormSubmittableValueChange={setIsFormSubmittable}
                    doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                />
                {termsAcceptanceRequired && (
                    <TermsAcceptance
                        i18n={i18n}
                        kcClsx={kcClsx}
                        messagesPerField={messagesPerField}
                        areTermsAccepted={areTermsAccepted}
                        onAreTermsAcceptedValueChange={setAreTermsAccepted}
                    />
                )}
                {recaptchaRequired && (recaptchaVisible || recaptchaAction === undefined) && (
                    <div className="form-group">
                        <div className={kcClsx("kcInputWrapperClass")}>
                            <div className="g-recaptcha" data-size="compact" data-sitekey={recaptchaSiteKey} data-action={recaptchaAction}></div>
                        </div>
                    </div>
                )}
                <div className={kcClsx("kcFormGroupClass")}>
                    {recaptchaRequired && !recaptchaVisible && recaptchaAction !== undefined ? (
                        <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                            <button
                                className={clsx(
                                    kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass"),
                                    "g-recaptcha",
                                    "rounded-md bg-primary-600 text-white focus:ring-primary-600 hover:bg-primary-700 px-4 py-2 text-sm flex justify-center relative w-full focus:outline-none focus:ring-2 focus:ring-offset-2"
                                )}
                                data-sitekey={recaptchaSiteKey}
                                data-callback={() => {
                                    (document.getElementById("kc-register-form") as HTMLFormElement).submit();
                                }}
                                data-action={recaptchaAction}
                                type="submit"
                            >
                                {msg("doRegister")}
                            </button>
                        </div>
                    ) : (
                        <div id="kc-form-buttons" className={kcClsx("kcFormButtonsClass")}>
                            <input
                                disabled={!isFormSubmittable || (termsAcceptanceRequired && !areTermsAccepted)}
                                className={clsx(
                                    kcClsx("kcButtonClass", "kcButtonPrimaryClass", "kcButtonBlockClass", "kcButtonLargeClass"),
                                    "rounded-md bg-primary-600 text-white focus:ring-primary-600 hover:bg-primary-700 px-4 py-2 text-sm flex justify-center relative w-full focus:outline-none focus:ring-2 focus:ring-offset-2"
                                )}
                                type="submit"
                                value={msgStr("doRegister")}
                            />
                        </div>
                    )}
                </div>
            </form>
        </Template>
    );
}

function TermsAcceptance(props: {
    i18n: I18n;
    kcClsx: KcClsx;
    messagesPerField: Pick<KcContext["messagesPerField"], "existsError" | "get">;
    areTermsAccepted: boolean;
    onAreTermsAcceptedValueChange: (areTermsAccepted: boolean) => void;
}) {
    const { i18n, kcClsx, messagesPerField, areTermsAccepted, onAreTermsAcceptedValueChange } = props;

    const { msg } = i18n;

    const [termsLink, setTermsLink] = useState<string>();
    const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const termsLinkElement = document.querySelector("[data-kc-msg='termsText']>a");
        if (!termsLinkElement) return;
        termsLinkElement.addEventListener("click", e => {
            e.preventDefault();
            setTermsModalOpen(true);
        });
        setTermsLink(termsLinkElement.getAttribute("href") ?? undefined);
    }, []);

    return (
        <div className="form-group">
            <div className={kcClsx("kcLabelWrapperClass")}>
                <label id="kc-registration-terms-text" htmlFor="termsAccepted" className="flex gap-2 font-normal">
                    <input
                        type="checkbox"
                        id="termsAccepted"
                        name="termsAccepted"
                        className="accent-primary-600"
                        checked={areTermsAccepted}
                        onChange={e => onAreTermsAcceptedValueChange(e.target.checked)}
                        aria-invalid={messagesPerField.existsError("termsAccepted")}
                    />
                    {msg("termsText")}
                </label>
                <TermsModal src={termsLink} open={termsModalOpen} setOpen={setTermsModalOpen} />
            </div>
            {messagesPerField.existsError("termsAccepted") && (
                <div className={kcClsx("kcLabelWrapperClass")}>
                    <span
                        id="input-error-terms-accepted"
                        className={kcClsx("kcInputErrorMessageClass")}
                        aria-live="polite"
                        dangerouslySetInnerHTML={{
                            __html: kcSanitize(messagesPerField.get("termsAccepted"))
                        }}
                    />
                </div>
            )}
        </div>
    );
}

interface TermsModalProps {
    src?: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}

function TermsModal({ src, open, setOpen }: TermsModalProps) {
    useEffect(() => {
        function keydown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("keydown", keydown);
        return () => document.removeEventListener("keydown", keydown);
    }, []);

    if (!src || !open) return null;

    return createPortal(
        <div className="absolute z-[99999] inset-0 flex flex-col p-0 sm:p-10" onClick={() => setOpen(false)}>
            <div className="relative w-full max-w-[1024px] m-auto grow bg-white shadow-2xl sm:rounded-2xl flex px-4 pt-16">
                <button
                    className="absolute top-4 right-4 size-8 z-10 hover:bg-gray-100 rounded-lg text-sm flex items-center justify-center"
                    onClick={() => setOpen(false)}
                >
                    <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                        <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
                    </svg>
                </button>
                <iframe src={src} className="grow" />
            </div>
        </div>,
        document.body
    );
}
