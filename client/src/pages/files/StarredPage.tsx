import { Star } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StarredPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-xl border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Star className="h-5 w-5 text-amber-500" />
            Starred Files
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Starred files view is a separate route now, ready for independent data and interaction logic.
        </CardContent>
      </Card>
    </div>
  )
}
