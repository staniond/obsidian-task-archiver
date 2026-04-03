import ObsidianTaskArchiver from "../ObsidianTaskArchiverPlugin";

describe("ObsidianTaskArchiver settings migration", () => {
    function createPluginWithSettings(userData: Record<string, unknown>) {
        const plugin = new ObsidianTaskArchiver({
            workspace: {
                getActiveFile: () => null,
                getActiveViewOfType: () => null,
            },
            vault: {
                getConfig: (key: string) => {
                    if (key === "useTab") {
                        return true;
                    }
                    if (key === "tabSize") {
                        return 4;
                    }
                    return undefined;
                },
            },
        } as never);

        plugin.loadData = jest.fn().mockResolvedValue(userData);
        return plugin;
    }

    test("migrates archiveAllCheckedTaskTypes=true to wildcard additional statuses", async () => {
        const plugin = createPluginWithSettings({
            archiveAllCheckedTaskTypes: true,
        });

        await plugin.loadSettings();

        expect(plugin.settings.archiveAdditionalTaskStatuses).toBe("*");
        expect(
            "archiveAllCheckedTaskTypes" in (plugin.settings as unknown as object)
        ).toBe(false);
    });

    test("keeps default additional statuses when archiveAllCheckedTaskTypes=false", async () => {
        const plugin = createPluginWithSettings({
            archiveAllCheckedTaskTypes: false,
        });

        await plugin.loadSettings();

        expect(plugin.settings.archiveAdditionalTaskStatuses).toBe("");
    });
});
