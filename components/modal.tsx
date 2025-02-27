import { ReactElement } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactElement;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Only close the modal if the click is on the overlay itself
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleContentClick = (e: React.MouseEvent) => {
        // Prevent click events from bubbling up to the overlay
        e.stopPropagation();
    };

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed top-0 left-0 z-999 w-full h-full bg-black/50 flex justify-center items-center"
        >
            <div
                onClick={handleContentClick}
                className="bg-white w-5/6 m-auto flex items-center justify-center p-5 rounded-lg shadow"
            >
                {children}
            </div>
        </div>
    );
};