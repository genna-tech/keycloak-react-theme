/* eslint-disable @typescript-eslint/no-explicit-any */

export class PostHog {
    get posthog() {
        return (window as any).posthog;
    }

    get isAvailable() {
        return "posthog" in window;
    }

    init({ host, key }: { host?: string; key?: string }) {
        if (!this.isAvailable) return;
        this.posthog.init(key, { api_host: host, person_profiles: "always" });
    }

    identify(user: any) {
        if (!this.isAvailable || !user) return;
        const attributes = {
            user_id: user.id,
            firstname: user.firstName,
            lastname: user.lastName,
            email: user.email,
            phone: user.attributes?.phone,
            instagram: user.attributes?.instagram
        };
        this.posthog.identify(attributes.user_id, attributes);
    }
}
