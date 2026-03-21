import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

/**
 * Returns a wrapper that checks auth before running an action.
 * If not authenticated, opens the auth modal instead.
 *
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   <button onClick={requireAuth(() => doSomething())}>Click</button>
 */
export function useRequireAuth() {
    const { isAuthenticated } = useAuth();
    const { openModal } = useAuthModal();

    return useCallback(
        <T extends (...args: any[]) => any>(action: T) =>
            (...args: Parameters<T>): ReturnType<T> | undefined => {
                if (!isAuthenticated) {
                    openModal('signin');
                    return undefined;
                }
                return action(...args);
            },
        [isAuthenticated, openModal]
    );
}
