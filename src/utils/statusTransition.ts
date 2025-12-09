import { ShipmentStatus, STATUS_TRANSITIONS } from '../types/index';


/**
 * Checks if a status transition is valid
 * @param currentStatus - The current status of the shipment
 * @param newStatus - The new status to transition to
 * @returns true if the transition is valid, false otherwise
 */
export const isValidStatusTransition = (
    currentStatus: ShipmentStatus,
    newStatus: ShipmentStatus
): boolean => {
    // The same status is always valid (no changing)
    if (currentStatus === newStatus) {
        return true;
    };

    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
};


/**
 * Gets the list of allowed status transitions from the current status
 * @param currentStatus - The current status of the shipment
 * @returns Array of allowed next statuses
 */
export const getAllowedTransitions = (currentStatus: ShipmentStatus): ShipmentStatus[] => {
    return STATUS_TRANSITIONS[currentStatus]
};


/**
 * Gets a human-readable error message for invalid status transitions
 * @param currentStatus - The current status of the shipment
 * @param newStatus - The attempted new status
 * @returns Error message string
 */
export const getInvalidTransitionMessage = (
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus
): string => {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];

  if (allowedTransitions.length === 0) {
    return `Cannot change status from '${currentStatus}'. This is a final state.`;
  }

  return `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${allowedTransitions.join(', ')}`;
};