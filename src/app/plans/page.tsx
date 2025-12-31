  "use client"
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Plan {
    id: string;
    name: string;
    description: string;
    active: boolean;
    images: string[];
    created: number;
    updated: number;
    type: string;
    default_price: {
        [key: string]: string;
    };
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [planLoading, setPlanLoading] = useState("");

    const handleSubscribe = async (priceId: string, planId: string) => {
        setLoading(true);
        setPlanLoading(planId);
        try {
          const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                priceId: priceId,
                planId: planId,
            }),
          });
          const { url } = await response.json();
          window.location.href = url; // Redirige a Stripe Checkout
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };

    useEffect(() => {
        const fetchPlans = async () => {
            const request = await fetch("/api/stripe/plans");
            const response = await request.json();
            setPlans(response.data);
        }
        fetchPlans();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Planes de Suscripción
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Elige el plan perfecto para potenciar tu carrera profesional
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="h-full hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant={plan.active ? "default" : "secondary"} className="rounded-full">
                                            {plan.active ? "Activo" : "Inactivo"}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full">
                                            {plan.type}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-square relative rounded-lg overflow-hidden mb-4">
                                        {plan.images[0] && (
                                            <img 
                                                src={plan.images[0]} 
                                                alt={plan.name}
                                                className="object-cover w-full h-full"
                                            />
                                        )}
                                    </div>
                                    <button onClick={() => handleSubscribe(plan?.default_price?.id, plan.id)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        {loading && planLoading === plan.id ? 'Cargando...' : 'Suscribirse al plan ' + plan.name}
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
