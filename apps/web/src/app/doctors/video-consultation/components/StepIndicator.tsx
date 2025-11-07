"use client";

import { cn } from "@repo/ui/cn";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300",
                  currentStep > step.id
                    ? "bg-blue-400 text-white shadow-md"
                    : currentStep === step.id
                    ? "bg-blue-400 text-white shadow-lg ring-2 ring-blue-400/30"
                    : "bg-muted text-muted-foreground border border-border"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  step.id
                )}
              </div>
              
              {/* Step Label - Hidden on mobile */}
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-12 h-0.5 mx-2 sm:mx-4 transition-colors duration-300",
                  currentStep > step.id ? "bg-blue-400" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}