import  { Component } from "react"
import type  { ReactNode } from "react"


import { Button } from "@/components/ui/button"

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
            <p className="text-sm text-gray-500">{this.state.message}</p>
            <Button onClick={() => window.location.reload()}>Reload page</Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}