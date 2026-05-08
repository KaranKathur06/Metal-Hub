import { evaluateProcurementGate, type ProcurementGateInput } from "./procurement-gates";
import { canTransitionRfq, type RfqAction, type RfqStatus } from "./procurement-workflow";

export type RfqActionAvailability = {
  action: RfqAction;
  enabled: boolean;
  reason?: string;
};

export function getRfqActionAvailability(input: {
  status: RfqStatus;
  procurementGate: ProcurementGateInput;
}) {
  const actions: RfqAction[] = ["edit", "publish", "cancel", "close", "quote"];

  return actions.map((action): RfqActionAvailability => {
    const transitionAllowed = canTransitionRfq(input.status, action);

    if (!transitionAllowed) {
      return {
        action,
        enabled: false,
        reason: "Status does not allow this action.",
      };
    }

    if (action === "publish") {
      const gate = evaluateProcurementGate({
        ...input.procurementGate,
        action: "publish_rfq",
      });

      return {
        action,
        enabled: gate.allowed,
        reason: gate.message,
      };
    }

    if (action === "quote") {
      const gate = evaluateProcurementGate({
        ...input.procurementGate,
        action: "submit_quote",
      });

      return {
        action,
        enabled: gate.allowed,
        reason: gate.message,
      };
    }

    return {
      action,
      enabled: true,
    };
  });
}

