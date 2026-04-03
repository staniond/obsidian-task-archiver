import { DEFAULT_SETTINGS } from "../../Settings";
import { replaceLegacySettings } from "../SettingsMigration";

describe("Settings migration", () => {
    test("migrates archiveAllCheckedTaskTypes=true to wildcard additional statuses", () => {
        const migrated = replaceLegacySettings({
            ...DEFAULT_SETTINGS,
            archiveAllCheckedTaskTypes: true,
        } as unknown as typeof DEFAULT_SETTINGS);

        expect(migrated.archiveAdditionalTaskStatuses).toBe("*");
        expect(
            "archiveAllCheckedTaskTypes" in (migrated as unknown as object)
        ).toBe(false);
    });

    test("keeps default additional statuses when archiveAllCheckedTaskTypes=false", () => {
        const migrated = replaceLegacySettings({
            ...DEFAULT_SETTINGS,
            archiveAllCheckedTaskTypes: false,
        } as unknown as typeof DEFAULT_SETTINGS);

        expect(migrated.archiveAdditionalTaskStatuses).toBe("");
        expect(
            "archiveAllCheckedTaskTypes" in (migrated as unknown as object)
        ).toBe(false);
    });
});
