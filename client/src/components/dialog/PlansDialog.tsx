import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type PlansDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Plan = {
  name: string
  subtitle: string
  price: string
  period: string
  badge?: string
  featured?: boolean
  current?: boolean
  cta: string
  perks: string[]
}

const plans: Plan[] = [
  {
    name: "Free",
    subtitle: "Perfect for getting started",
    price: "$0",
    period: "/mo",
    current: true,
    cta: "Current Plan",
    perks: ["5GB Secure Storage", "100MB File Size Limit", "Basic File Sharing"],
  },
  {
    name: "Pro",
    subtitle: "For individuals and power users",
    price: "$9.99",
    period: "/mo",
    badge: "RECOMMENDED",
    featured: true,
    cta: "Upgrade Now",
    perks: ["1TB Secure Storage", "10GB File Size Limit", "Advanced Sharing Controls", "Password Protected Links"],
  },
  {
    name: "Business",
    subtitle: "Unlimited power for teams",
    price: "$24.99",
    period: "/mo",
    cta: "Upgrade Now",
    perks: ["Unlimited Secure Storage", "No File Size Limit", "Admin Console & Audit Logs", "24/7 Priority Support", "Custom Branding"],
  },
]

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={cn(
        "relative h-full border border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-[#18181B]",
        plan.featured && "border-orange-500"
      )}
    >
      {plan.badge ? (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-xl bg-blue-600 px-4 py-1 text-[11px] font-bold tracking-[0.08em] text-white">
          {plan.badge}
        </div>
      ) : null}

      {plan.current ? (
        <div className="absolute right-4 top-7 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          CURRENT
        </div>
      ) : null}

      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div className="space-y-2">
          <h3 className="text-[30px] font-semibold leading-none tracking-tight">{plan.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">{plan.subtitle}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-bold leading-none tracking-tight">{plan.price}</span>
          <span className="text-xl text-slate-500 dark:text-slate-300">{plan.period}</span>
        </div>

        <Button
          className={cn(
            "h-10 rounded-md text-sm font-semibold",
            plan.current && "bg-slate-100 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
            plan.featured && "bg-blue-600 text-white hover:bg-blue-700",
            !plan.featured && !plan.current && "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          )}
          disabled={plan.current}
        >
          {plan.cta}
        </Button>

        <ul className="space-y-3 pt-1">
          {plan.perks.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
              <CheckCircle2 className="mt-[1px] h-4 w-4 shrink-0 text-blue-600" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function PlansDialog({ open, onOpenChange }: PlansDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[92vw] max-w-4xl overflow-y-auto rounded-2xl border-slate-300 p-5 sm:p-6 dark:border-slate-700 dark:bg-[#18181B]">
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-tight">Choose Your Plan</DialogTitle>
          <DialogDescription>Demo pricing modal for subscription tiers.</DialogDescription>
        </DialogHeader>

        <section className="grid gap-5 pb-1 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </section>
      </DialogContent>
    </Dialog>
  )
}
