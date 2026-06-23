import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Report } from "../../services/api";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ReportMapProps {
  reports: Report[];
  height?: string;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

export function ReportMap({ reports, height = "400px", onLocationSelect }: ReportMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-1.2921, 36.8219], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Add click event for location selection
      if (onLocationSelect) {
        mapRef.current.on("click", async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          
          // Reverse geocoding mock (in production, use a real geocoding service)
          const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          onLocationSelect(lat, lng, address);
          
          // Add temporary marker
          L.marker([lat, lng])
            .addTo(mapRef.current!)
            .bindPopup("Selected Location")
            .openPopup();
        });
      }
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    // Add markers for reports
    reports.forEach((report) => {
      const markerColor = 
        report.priority === "High" ? "red" :
        report.priority === "Medium" ? "orange" :
        "green";

      // Create custom icon based on priority
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([report.location.lat, report.location.lng], {
        icon: customIcon,
      }).addTo(mapRef.current!);

      // Add popup with report details
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600;">${report.title}</h3>
          <p style="margin: 4px 0; font-size: 14px;">${report.description.substring(0, 100)}...</p>
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="
              background-color: ${markerColor};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
            ">${report.priority}</span>
            <span style="
              background-color: ${
                report.status === "Resolved" ? "green" :
                report.status === "In Progress" ? "blue" :
                report.status === "Pending" ? "orange" :
                "gray"
              };
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
            ">${report.status}</span>
            <span style="
              background-color: #6b7280;
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
            ">${report.category}</span>
          </div>
          ${report.imageUrl ? `<img src="${report.imageUrl}" alt="${report.title}" style="width: 100%; margin-top: 8px; border-radius: 4px;" />` : ""}
        </div>
      `);
    });

    // Cleanup
    return () => {
      if (mapRef.current && reports.length === 0) {
        // Don't destroy map, just clear markers
      }
    };
  }, [reports, onLocationSelect]);

  return <div ref={mapContainerRef} style={{ height, width: "100%", borderRadius: "8px" }} />;
}
