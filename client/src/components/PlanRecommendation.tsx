
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const PlanRecommendation = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const questions = [
    {
      question: "What's your primary purpose for travel?",
      options: [
        { value: "tourism", label: "Tourism & Leisure" },
        { value: "family", label: "Visiting Family/Diaspora" },
        { value: "business", label: "Business Travel" },
        { value: "ngo", label: "NGO/Development Work" },
      ]
    },
    {
      question: "How long will you be traveling?",
      options: [
        { value: "short", label: "1-7 days" },
        { value: "medium", label: "1-4 weeks" },
        { value: "long", label: "1-3 months" },
        { value: "extended", label: "3+ months" },
      ]
    },
    {
      question: "How much data do you typically use?",
      options: [
        { value: "light", label: "Light (1-2 GB/month)" },
        { value: "moderate", label: "Moderate (3-5 GB/month)" },
        { value: "heavy", label: "Heavy (10+ GB/month)" },
        { value: "unlimited", label: "As much as possible" },
      ]
    }
  ];

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate recommendation
      const rec = calculateRecommendation(newAnswers);
      setRecommendation(rec);
    }
  };

  const calculateRecommendation = (answers: string[]) => {
    const [purpose, duration, data] = answers;

    if (purpose === "tourism" && duration === "short") return "lite";
    if (purpose === "family") return "core";
    if (purpose === "business" || data === "heavy") return "plus";
    if (purpose === "ngo" || duration === "extended") return "ngo";
    if (duration === "medium" && data === "moderate") return "core";
    
    return "core"; // default recommendation
  };

  const getPlanDetails = (planId: string) => {
    const plans = {
      lite: { name: "Lite", price: "€6.00", description: "Perfect for short tourist trips" },
      core: { name: "Core", price: "€12.50", description: "Ideal for diaspora and family visits" },
      plus: { name: "Plus", price: "€27.50", description: "Built for business travelers" },
      ngo: { name: "NGO Pack", price: "€20-50", description: "Designed for field operations" },
    };
    return plans[planId as keyof typeof plans];
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
    setRecommendation(null);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answer a few quick questions and we'll recommend the best plan for your needs
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!recommendation ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  Question {step + 1} of {questions.length}
                </CardTitle>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-palop-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-6 text-center">
                  {questions[step].question}
                </h3>
                <RadioGroup onValueChange={handleAnswer} className="space-y-4">
                  {questions[step].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-palop-green">
              <CardHeader className="bg-palop-green text-white text-center">
                <CardTitle>🎉 We Found Your Perfect Plan!</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-palop-green mb-2">
                    {getPlanDetails(recommendation)?.name} Plan
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {getPlanDetails(recommendation)?.description}
                  </p>
                  <div className="text-3xl font-bold text-gray-800">
                    {getPlanDetails(recommendation)?.price}
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button className="bg-palop-green hover:bg-palop-green/90" asChild>
                    <Link to={`/purchase?plan=${recommendation}`}>Get This Plan</Link>
                  </Button>
                  <Button variant="outline" onClick={resetQuiz}>
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default PlanRecommendation;
