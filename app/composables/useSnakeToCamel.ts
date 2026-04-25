import { snakeToCamel, camelToSnake } from "~/utils/case";

/**
 * Composable for converting between snake_case and camelCase
 * Useful when working with API responses that use snake_case
 */
export function useSnakeToCamel() {
    /**
     * Convert snake_case object to camelCase
     */
    function toCamel<T>(obj: unknown): T {
        return snakeToCamel<T>(obj);
    }

    /**
     * Convert camelCase object to snake_case (for API requests)
     */
    function toSnake<T>(obj: unknown): T {
        return camelToSnake<T>(obj);
    }

    /**
     * Create a reactive ref that auto-converts from snake_case
     */
    function useConvertedRef<T>(initialValue: unknown) {
        const converted = ref<T>(toCamel<T>(initialValue));

        function setValue(newValue: unknown) {
            converted.value = toCamel<T>(newValue);
        }

        return {
            value: converted,
            setValue,
        };
    }

    /**
     * Fetch wrapper that auto-converts response from snake_case to camelCase
     */
    async function fetchConverted<T>(
        url: string,
        options?: RequestInit,
    ): Promise<T> {
        const response = await fetch(url, options);
        const data = await response.json();
        return toCamel<T>(data);
    }

    return {
        toCamel,
        toSnake,
        useConvertedRef,
        fetchConverted,
    };
}
