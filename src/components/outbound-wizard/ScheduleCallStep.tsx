import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { OutboundCallData } from "../TriggerOutboundCallsWizard"
import { ArrowRight, ArrowLeft, Clock, Calendar, Zap } from "lucide-react"

interface ScheduleCallStepProps {
  data: OutboundCallData
  onUpdate: (updates: Partial<OutboundCallData>) => void
  onNext: () => void
  onBack: () => void
}

export function ScheduleCallStep({ data, onUpdate, onNext, onBack }: ScheduleCallStepProps) {
  const handleScheduleChange = (value: string) => {
    onUpdate({ 
      schedulingOption: value as 'now' | 'best_time' | 'custom',
      customDateTime: undefined // Reset custom date when changing options
    })
  }

  const handleCustomDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ customDateTime: new Date(e.target.value) })
  }

  const canProceed = data.schedulingOption === 'custom' ? !!data.customDateTime : true

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Schedule call
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-4 block">
                When would you like to trigger the calls?
              </Label>
              
              <RadioGroup 
                value={data.schedulingOption} 
                onValueChange={handleScheduleChange}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="now" id="now" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="now" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Zap className="h-4 w-4 text-primary" />
                      Trigger calls now
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start calling patients immediately after review
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="best_time" id="best_time" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="best_time" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Clock className="h-4 w-4 text-primary" />
                      Trigger at next best time
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      System will determine the optimal time based on patient preferences and availability
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="custom" id="custom" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="custom" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Calendar className="h-4 w-4 text-primary" />
                      Schedule for specific time
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Choose exact date and time for triggering calls
                    </p>
                    
                    {data.schedulingOption === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="customDateTime" className="text-sm">
                          Select date and time
                        </Label>
                        <Input
                          id="customDateTime"
                          type="datetime-local"
                          value={data.customDateTime ? data.customDateTime.toISOString().slice(0, 16) : ''}
                          onChange={handleCustomDateTimeChange}
                          min={new Date().toISOString().slice(0, 16)}
                          className="max-w-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Call summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• {data.patients.length} patients will be called</p>
                <p>• Calls will use the selected outbound communication protocols</p>
                <p>• You can monitor progress in the patient interactions dashboard</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={onNext} 
                disabled={!canProceed}
                className="flex-1"
              >
                Continue to review
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}