import { Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SharedPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-xl border-slate-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Users className="h-5 w-5 text-blue-600" />
            Shared Files
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Shared files view is now isolated as its own page and can be implemented independently without touching the shell layout.
        </CardContent>
      </Card>
    </div>
  )
}
