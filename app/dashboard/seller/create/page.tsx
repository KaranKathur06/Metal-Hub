"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const steps = [
  { id: 1, title: "Basic Details" },
  { id: 2, title: "Metal Specifications" },
  { id: 3, title: "Images" },
  { id: 4, title: "Review & Publish" },
]

export default function CreateListingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    metalType: "",
    price: "",
    quantity: "",
    unit: "MT",
    location: "",
    grade: "",
    thickness: "",
    standard: "",
  })
  const [images, setImages] = useState<string[]>([])

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // TODO: Implement API call
    router.push("/dashboard/seller")
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/dashboard/seller"
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold">Create New Listing</h1>
        <p className="mt-2 text-muted-foreground">
          Follow the steps to list your metal product
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep >= step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-background text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <div className="mt-2 text-xs font-medium">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., MS Steel Plates - Grade A"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe your product in detail..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="metalType">Metal Type *</Label>
                      <Select
                        value={formData.metalType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, metalType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select metal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="steel">Steel</SelectItem>
                          <SelectItem value="iron">Iron</SelectItem>
                          <SelectItem value="aluminium">Aluminium</SelectItem>
                          <SelectItem value="copper">Copper</SelectItem>
                          <SelectItem value="brass">Brass</SelectItem>
                          <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Specifications */}
              {currentStep === 2 && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Unit *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="45000"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          setFormData({ ...formData, unit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                          <SelectItem value="KG">KG (Kilogram)</SelectItem>
                          <SelectItem value="PC">PC (Piece)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Available Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="50"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        placeholder="e.g., Grade A"
                        value={formData.grade}
                        onChange={(e) =>
                          setFormData({ ...formData, grade: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thickness">Thickness</Label>
                      <Input
                        id="thickness"
                        placeholder="e.g., 5mm - 50mm"
                        value={formData.thickness}
                        onChange={(e) =>
                          setFormData({ ...formData, thickness: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="standard">Standard</Label>
                    <Input
                      id="standard"
                      placeholder="e.g., IS 2062"
                      value={formData.standard}
                      onChange={(e) =>
                        setFormData({ ...formData, standard: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {/* Step 3: Images */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>Product Images</Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                            <div className="flex h-full items-center justify-center">
                              Image {index + 1}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() =>
                              setImages(images.filter((_, i) => i !== index))
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {images.length < 5 && (
                        <button
                          type="button"
                          className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary"
                          onClick={() => setImages([...images, ""])}
                        >
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              Upload Image
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload up to 5 images. First image will be the main image.
                    </p>
                  </div>
                </>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Title</h3>
                    <p className="text-muted-foreground">{formData.title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-muted-foreground">{formData.description}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="font-semibold">Metal Type</h3>
                      <p className="text-muted-foreground">{formData.metalType}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-muted-foreground">{formData.location}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Price</h3>
                      <p className="text-muted-foreground">
                        ₹{formData.price} / {formData.unit}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Quantity</h3>
                      <p className="text-muted-foreground">
                        {formData.quantity} {formData.unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Publish Listing</Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li>• Use clear, descriptive titles</li>
                <li>• Include detailed specifications</li>
                <li>• Upload high-quality images</li>
                <li>• Set competitive pricing</li>
                <li>• Respond to inquiries quickly</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

