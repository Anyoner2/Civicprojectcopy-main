import { useState, useCallback } from "react";
import apiService, { Report, ReportSubmitData } from "../services/api";
import { useAuth } from "../app/contexts/AuthContext";

export interface ReportFormData {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
}

export function useReports() {
  const { accessToken } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!accessToken) {
      setError("Not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getReports(accessToken);
      
      if (response.success && response.data) {
        setReports(response.data);
      } else {
        setError(response.error || "Failed to fetch reports");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching reports");
      console.error("Error fetching reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const submitReport = useCallback(async (data: ReportFormData): Promise<Report | null> => {
    if (!accessToken) {
      setError("Not authenticated");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      const submitData: ReportSubmitData = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
      };
      const response = await apiService.submitReport(submitData, accessToken);
      
      if (response.success && response.data) {
        setReports([...reports, response.data]);
        return response.data;
      } else {
        setError(response.error || "Failed to submit report");
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error submitting report";
      setError(errorMessage);
      console.error("Error submitting report:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, reports]);

  const updateReportStatus = useCallback(async (reportId: string, status: string): Promise<boolean> => {
    if (!accessToken) {
      setError("Not authenticated");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.updateReportStatus(reportId, status, accessToken);
      
      if (response.success && response.data) {
        // Update local state
        const updatedReport = response.data as Report;
        setReports(reports.map(r => r.id === reportId ? updatedReport : r));
        return true;
      } else {
        setError(response.error || "Failed to update report status");
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error updating report";
      setError(errorMessage);
      console.error("Error updating report:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, reports]);

  return {
    reports,
    isLoading,
    error,
    fetchReports,
    submitReport,
    updateReportStatus,
  };
}

export interface Analytics {
  totalReports: number;
  pendingReports: number;
  inProgressReports: number;
  resolvedReports: number;
  rejectedReports: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  averageResolutionTime: string;
}

export interface CategoryData {
  id: string;
  name: string;
  value: number;
}

export interface MonthlyTrend {
  id: string;
  month: string;
  reports: number;
}

export function useAnalytics() {
  const { accessToken } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!accessToken) {
      setError("Not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAnalytics(accessToken);
      
      if (response.success && response.data) {
        setAnalytics(response.data);
        setCategoryDistribution(response.data.categoryDistribution || []);
        setMonthlyTrends(response.data.monthlyTrends || []);
      } else {
        setError(response.error || "Failed to fetch analytics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching analytics");
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    analytics,
    categoryDistribution,
    monthlyTrends,
    isLoading,
    error,
    fetchAnalytics,
  };
}

export interface MLStats {
  totalReports: number;
  trainedReports: number;
  untrainedReports: number;
  trainingDataSamples: number;
  modelAccuracy: string;
  lastTrainedAt: string | null;
}

export function useMLTraining() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<MLStats | null>(null);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMLStats = useCallback(async () => {
    if (!accessToken) {
      setError("Not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getMLStats(accessToken);
      
      if (response.success && response.data) {
        setStats(response.data.stats);
      } else {
        setError(response.error || "Failed to fetch ML stats");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching ML stats");
      console.error("Error fetching ML stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const submitTrainingData = useCallback(async (
    reportId: string,
    correctedPriority: string,
    correctedSeverity: number,
    correctedRiskFactor: number
  ): Promise<boolean> => {
    if (!accessToken) {
      setError("Not authenticated");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.submitTrainingData(
        reportId,
        correctedPriority,
        correctedSeverity,
        correctedRiskFactor,
        accessToken
      );
      
      if (response.success) {
        await fetchMLStats();
        return true;
      } else {
        setError(response.error || "Failed to submit training data");
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error submitting training data";
      setError(errorMessage);
      console.error("Error submitting training data:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const retrainModel = useCallback(async (): Promise<boolean> => {
    if (!accessToken) {
      setError("Not authenticated");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.retrainModel(accessToken);
      
      if (response.success) {
        await fetchMLStats();
        return true;
      } else {
        setError(response.error || "Failed to retrain model");
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error retraining model";
      setError(errorMessage);
      console.error("Error retraining model:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const fetchTrainingData = useCallback(async () => {
    if (!accessToken) {
      setError("Not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getTrainingData(accessToken);
      
      if (response.success && response.data) {
        setTrainingData(response.data.trainingData || []);
      } else {
        setError(response.error || "Failed to fetch training data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching training data");
      console.error("Error fetching training data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  return {
    stats,
    trainingData,
    isLoading,
    error,
    fetchMLStats,
    submitTrainingData,
    retrainModel,
    fetchTrainingData,
  };
}
