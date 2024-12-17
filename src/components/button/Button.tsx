//Button.tsx

import type React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface ButtonProps {
    onClick?: () => void; // Optional for submit/reset cases
    label: string;
    disabled?: boolean;
    loading?: boolean; // Indicates loading state
    type?: 'primary' | 'secondary' | 'danger'; // Styling classes
    htmlType?: 'button' | 'submit' | 'reset'; // HTML button types
    icon?: IconDefinition; // Icon from FontAwesome
}

const Button: React.FC<ButtonProps> = ({
                                           onClick,
                                           label,
                                           disabled = false,
                                           loading = false,
                                           type = 'primary',
                                           icon,
                                           htmlType = 'button',
                                       }) => (
    <button
        type={htmlType}
        onClick={onClick}
        disabled={disabled || loading}
        className={`button ${type}`}
        aria-busy={loading}
    >
        {loading ? (
            <span className="spinner" /> // Display spinner if loading
        ) : (
            <>
                {icon && <FontAwesomeIcon icon={icon} className="button-icon" />} {/* Render icon */}
                {label}
            </>
        )}
    </button>
);

export default Button;