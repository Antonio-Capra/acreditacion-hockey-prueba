"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Area {
  codigo: string;
  nombre: string;
  cupos: number;
}

interface Acreditado {
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  rut: string;
  email: string;
  cargo: string;
  tipo_credencial: string;
  numero_credencial: string;
}

interface FormData {
  responsable_nombre: string;
  responsable_primer_apellido: string;
  responsable_segundo_apellido: string;
  responsable_email: string;
  responsable_telefono: string;
  empresa: string;
  area: string;
  acreditados: Acreditado[];
}

// Fallback areas in case Supabase table doesn't exist
const FALLBACK_AREAS: Area[] = [
  { codigo: "A", nombre: "Radiales con caseta", cupos: 5 },
  { codigo: "B", nombre: "Radiales sin caseta", cupos: 3 },
  { codigo: "C", nombre: "TV Nacionales", cupos: 2 },
  { codigo: "D", nombre: "Sitios Web", cupos: 2 },
  { codigo: "E", nombre: "Medios Escritos", cupos: 2 },
  { codigo: "F", nombre: "Agencias", cupos: 1 },
  { codigo: "G", nombre: "Reportero gráfico cancha", cupos: 1 },
];

export function useAcreditacion() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cuposError, setCuposError] = useState<{
    show: boolean;
    empresa: string;
    area: string;
    maximo: number;
    existentes: number;
    solicitados: number;
  } | null>(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from Supabase first
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('codigo');

      if (error) {
        // If Supabase fails, use fallback data
        console.warn('Error fetching areas from Supabase, using fallback data:', error.message);
        setAreas(FALLBACK_AREAS);
      } else {
        setAreas(data || FALLBACK_AREAS);
      }
    } catch (err) {
      // If any error occurs, use fallback data
      console.warn('Error fetching areas, using fallback data:', err);
      setAreas(FALLBACK_AREAS);
      setError(null); // Don't show error since we have fallback
    } finally {
      setLoading(false);
    }
  };

  const submitAcreditacion = async (formData: FormData): Promise<{ success: boolean; cuposError?: boolean }> => {
    try {
      setLoading(true);
      setError(null);

      // Validar que todos los campos requeridos estén presentes
      if (!formData.responsable_nombre?.trim()) {
        throw new Error('El nombre del responsable es requerido');
      }
      if (!formData.responsable_primer_apellido?.trim()) {
        throw new Error('El primer apellido del responsable es requerido');
      }
      if (!formData.responsable_email?.trim()) {
        throw new Error('El email del responsable es requerido');
      }
      if (!formData.empresa?.trim()) {
        throw new Error('El nombre de la empresa es requerido');
      }
      if (!formData.area?.trim()) {
        throw new Error('El área es requerida');
      }
      if (!formData.acreditados?.length) {
        throw new Error('Debe haber al menos un acreditado');
      }

      const payload = {
        responsable_nombre: formData.responsable_nombre.trim(),
        responsable_primer_apellido: formData.responsable_primer_apellido.trim(),
        responsable_segundo_apellido: formData.responsable_segundo_apellido?.trim() || '',
        responsable_email: formData.responsable_email.trim(),
        responsable_telefono: formData.responsable_telefono?.trim() || '',
        empresa: formData.empresa.trim(),
        area: formData.area.trim(),
        acreditados: formData.acreditados.map(a => ({
          nombre: a.nombre?.trim() || '',
          primer_apellido: a.primer_apellido?.trim() || '',
          segundo_apellido: a.segundo_apellido?.trim() || '',
          rut: a.rut?.trim() || '',
          email: a.email?.trim() || '',
          cargo: a.cargo?.trim() || '',
          tipo_credencial: a.tipo_credencial?.trim() || '',
          numero_credencial: a.numero_credencial?.trim() || '',
        })),
      };

      const response = await fetch('/api/acreditaciones/prensa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData: any = {};
        let errorMessage = `Error del servidor: ${response.status}`;
        
        try {
          // Get response as text first
          const responseText = await response.text();
          
          if (responseText.trim()) {
            // Try to parse as JSON
            try {
              errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
              // If not JSON, use the text as error message
              errorMessage = responseText;
            }
          }
        } catch (textError) {
          console.error('Failed to get response text:', textError);
        }
        
        // Log for debugging (remove in production)
        // console.error('API Error Response:', errorData);
        // console.error('Error Message:', errorMessage);
        
        // Check if it's a cupos error
        if (errorMessage.includes('No hay cupos disponibles')) {
          // Extract cupos information from error message
          const cuposMatch = errorMessage.match(/No hay cupos disponibles para (.+?) en el área (.+?)\. Máximo: (\d+), Acreditados existentes: (\d+), Solicitados: (\d+), Total: (\d+)/);
          if (cuposMatch) {
            const [, empresa, area, maximo, existentes, solicitados] = cuposMatch;
            setCuposError({
              show: true,
              empresa,
              area,
              maximo: parseInt(maximo),
              existentes: parseInt(existentes),
              solicitados: parseInt(solicitados),
            });
            return { success: false, cuposError: true }; // Return instead of throwing
          }
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al enviar';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const closeCuposError = () => {
    setCuposError(null);
  };

  return {
    areas,
    loading,
    error,
    cuposError,
    closeCuposError,
    submitAcreditacion,
    refetchAreas: fetchAreas,
  };
}