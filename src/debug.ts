const DEBUG_LOG_PREFIX = "[LiveTemplater]";

export function debugLog(message: string, details?: Record<string, unknown>) {
	console.debug(`${DEBUG_LOG_PREFIX} ${message}`, details ?? {});
}
