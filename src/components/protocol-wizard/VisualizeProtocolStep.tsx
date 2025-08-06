import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtocolData } from "../CreateProtocolWizard"
import { ArrowLeft, Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VisualizeProtocolStepProps {
  data: ProtocolData
  onNext: () => void
  onBack: () => void
}

export function VisualizeProtocolStep({ data, onNext, onBack }: VisualizeProtocolStepProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleReviewAndSave = () => {
    setShowConfirmDialog(true)
  }

  const confirmSave = () => {
    setShowConfirmDialog(false)
    onNext()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center">
            Protocol Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Protocol visualization will be available in a future update.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Your protocol "{data.name}" has been processed and is ready for review.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Coming Soon:</p>
              <ul className="text-left space-y-1">
                <li>• <strong>Review Simulations:</strong> Test scenarios with your protocol</li>
                <li>• <strong>Run Simulations:</strong> Live testing with real patient data</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleReviewAndSave}>
              <Check className="h-4 w-4 mr-2" />
              Review and Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review and Save Protocol</DialogTitle>
            <DialogDescription>
              Are you sure you want to save "{data.name}" protocol? This will create a new protocol that can be used for patient triage.
              <br /><br />
              <span className="text-sm text-muted-foreground">
                Note: Steps 4 and 5 (Review Simulations and Run Simulations) will be available in a future update.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSave}>
              <Check className="h-4 w-4 mr-2" />
              Save Protocol
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}