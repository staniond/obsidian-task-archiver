import { DEFAULT_DATE_FORMAT, DEFAULT_WEEK_FORMAT, placeholders } from "../Constants";
import { Settings } from "../Settings";

export function replaceLegacySettings(settings: Settings) {
    const updated = {
        ...settings,
    } as Settings & {
        archiveAllCheckedTaskTypes?: boolean;
    };

    if (updated.archiveHeading) {
        updated.headings = [{ text: updated.archiveHeading }];
        delete updated.archiveHeading;
    }

    if (updated.useWeeks) {
        updated.archiveUnderListItems = true;
        updated.listItems = [
            {
                text: `[[${placeholders.DATE}]]`,
                dateFormat: updated.weeklyNoteFormat || DEFAULT_WEEK_FORMAT,
            },
        ];

        delete updated.useWeeks;
        delete updated.weeklyNoteFormat;
    }

    if (updated.useDays) {
        updated.archiveUnderListItems = true;
        updated.listItems = [
            {
                text: `[[${placeholders.DATE}]]`,
                dateFormat: updated.dailyNoteFormat || DEFAULT_DATE_FORMAT,
            },
        ];

        delete updated.useDays;
        delete updated.dailyNoteFormat;
    }

    if (updated.archiveAllCheckedTaskTypes === true) {
        updated.archiveAdditionalTaskStatuses = "*";
    }

    delete updated.archiveAllCheckedTaskTypes;

    return updated;
}
