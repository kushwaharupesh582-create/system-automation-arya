// ============================================================================
// ARYA CONTROLLER — Background Service Worker
// Polls Arya's Flask server for commands and executes them on browser tabs.
// ============================================================================

const ARYA_URL = "http://localhost:5000";
const POLL_INTERVAL = 1000; // 1 second

console.log("[Arya Extension] Background service started");

// ── Poll Arya for commands ──────────────────────────────────────────────────
async function pollArya() {
    try {
        const response = await fetch(`${ARYA_URL}/tab/command`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            // Server reachable but no command — normal
            return;
        }

        const data = await response.json();

        if (!data || !data.command) {
            return; // No command waiting
        }

        console.log("[Arya Extension] Received command:", data);
        const result = await executeCommand(data);

        // Send result back to Arya
        await fetch(`${ARYA_URL}/tab/result`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                command_id: data.command_id,
                success: result.success,
                data: result.data,
                error: result.error || null
            })
        });
    } catch (error) {
        // Arya server not running — silently skip
        // (Avoid log spam: don't console.log here)
    }
}

// ── Execute a command on browser tabs ───────────────────────────────────────
async function executeCommand(cmd) {
    try {
        switch (cmd.command) {
            case "list_tabs":
                return await listTabs();
            case "close_tab_by_name":
                return await closeTabByName(cmd.params?.name || "");
            case "close_current_tab":
                return await closeCurrentTab();
            case "switch_tab_by_name":
                return await switchTabByName(cmd.params?.name || "");
            case "close_all_matching":
                return await closeAllMatching(cmd.params?.name || "");
            default:
                return { success: false, error: `Unknown command: ${cmd.command}` };
        }
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ── COMMANDS ────────────────────────────────────────────────────────────────

async function listTabs() {
    const tabs = await chrome.tabs.query({});
    const list = tabs.map(t => ({
        id: t.id,
        title: t.title,
        url: t.url,
        active: t.active,
        windowId: t.windowId
    }));
    return { success: true, data: { tabs: list, count: list.length } };
}

async function closeTabByName(name) {
    if (!name) return { success: false, error: "No tab name provided" };

    const nameLower = name.toLowerCase();
    const tabs = await chrome.tabs.query({});
    const matches = tabs.filter(t => {
        const title = (t.title || "").toLowerCase();
        const url = (t.url || "").toLowerCase();
        return title.includes(nameLower) || url.includes(nameLower);
    });

    if (matches.length === 0) {
        return { success: false, error: `No tab matching "${name}"` };
    }

    // Close first match
    await chrome.tabs.remove(matches[0].id);
    return {
        success: true,
        data: {
            closed: matches[0].title,
            url: matches[0].url,
            matches_count: matches.length
        }
    };
}

async function closeAllMatching(name) {
    if (!name) return { success: false, error: "No tab name provided" };

    const nameLower = name.toLowerCase();
    const tabs = await chrome.tabs.query({});
    const matches = tabs.filter(t => {
        const title = (t.title || "").toLowerCase();
        const url = (t.url || "").toLowerCase();
        return title.includes(nameLower) || url.includes(nameLower);
    });

    if (matches.length === 0) {
        return { success: false, error: `No tabs matching "${name}"` };
    }

    const ids = matches.map(t => t.id);
    await chrome.tabs.remove(ids);
    return { success: true, data: { closed_count: ids.length } };
}

async function closeCurrentTab() {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab) return { success: false, error: "No active tab" };

    await chrome.tabs.remove(activeTab.id);
    return { success: true, data: { closed: activeTab.title } };
}

async function switchTabByName(name) {
    if (!name) return { success: false, error: "No tab name provided" };

    const nameLower = name.toLowerCase();
    const tabs = await chrome.tabs.query({});
    const match = tabs.find(t => {
        const title = (t.title || "").toLowerCase();
        const url = (t.url || "").toLowerCase();
        return title.includes(nameLower) || url.includes(nameLower);
    });

    if (!match) return { success: false, error: `No tab matching "${name}"` };

    await chrome.tabs.update(match.id, { active: true });
    await chrome.windows.update(match.windowId, { focused: true });
    return { success: true, data: { switched_to: match.title } };
}

// Poll immediately on startup
pollArya();

// Then poll every 1 second
setInterval(pollArya, POLL_INTERVAL);

console.log(`[Arya Extension] Polling ${ARYA_URL} every ${POLL_INTERVAL}ms`);