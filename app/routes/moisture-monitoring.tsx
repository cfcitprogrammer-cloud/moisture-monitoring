import React, { useState } from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Card, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";

const TIMES = [
  "6AM",
  "9AM",
  "12PM",
  "3PM",
  "6PM",
  "9PM",
  "12AM",
  "3AM",
] as const;
const LINES = ["LINE 1", "LINE 2", "LINE 3"] as const;

export default function MoistureMonitoringSystem() {
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formData, setFormData] = useState(() => {
    const initial: any = {};
    LINES.forEach((line) => {
      initial[line] = {};
      TIMES.forEach((time) => {
        initial[line][time] = {
          steam: "",
          smallConveyor: "",
          cutter: "",
          dryerSpeed: "",
          dryerTemp1: "",
          dryerTemp2: "",
          moisture: "",
        };
      });
    });
    return initial;
  });

  const [loading, setLoading] = useState(false); // <-- loading state

  const handleChange = (
    line: string,
    time: string,
    field: string,
    value: string,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [line]: {
        ...prev[line],
        [time]: {
          ...prev[line][time],
          [field]: value,
        },
      },
    }));
  };

  const numericOnly = (value: string) => value.replace(/[^0-9.]/g, "");

  const handleSubmit = async () => {
    setLoading(true); // start loading
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycby5c3Jeja2nxb4h6cYfhjzTDJ8lywkdeLvh5pJlDkuQqggy6b55HmlPf6oH0mpypv8/exec",
        {
          method: "POST",
          headers: { "Content-Type": "text/plain" }, // plain text
          body: JSON.stringify({ productionDate, data: formData }),
        },
      );

      const result = await res.json();
      alert(
        result.status === "success" ? "Submitted!" : "Error: " + result.message,
      );
    } catch (err: any) {
      alert("Submission failed: " + err.message);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const inputStyle =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelStyle = "text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="w-full p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            Moisture Monitoring (8.0% max)
          </h1>
          <p className="text-sm text-slate-500 italic">
            Shift Entry: 6AM to 3AM
          </p>
          <div className="mt-4">
            <label className={labelStyle}>Production Date</label>
            <input
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              className={inputStyle}
            />
          </div>
        </div>

        <Button
          color="primary"
          size="sm"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Sheet"} {/* <-- show loading */}
        </Button>
      </div>

      <Accordion
        variant="splitted"
        selectionMode="multiple"
        defaultExpandedKeys={["line-0"]}
      >
        {LINES.map((lineName, lineIdx) => (
          <AccordionItem
            key={`line-${lineIdx}`}
            aria-label={lineName}
            title={<span className="font-bold text-slate-700">{lineName}</span>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-2">
              {TIMES.map((time) => {
                const moisture =
                  parseFloat(formData[lineName][time].moisture) || 0;
                return (
                  <Card key={time} shadow="sm">
                    <CardBody>
                      <div className="flex justify-between mb-3">
                        <span className="font-bold text-blue-800">{time}</span>
                        {(time === "12AM" || time === "3AM") && (
                          <span className="text-xs text-amber-600 font-bold">
                            Next Day
                          </span>
                        )}
                      </div>
                      <Divider className="mb-4" />
                      <div className="space-y-3">
                        {[
                          { key: "steam", label: "Steam" },
                          { key: "smallConveyor", label: "Small Conveyor" },
                          { key: "cutter", label: "Cutter" },
                          { key: "dryerSpeed", label: "Dryer Speed" },
                        ].map(({ key, label }) => (
                          <div key={key}>
                            <label className={labelStyle}>{label}</label>
                            <input
                              type="text"
                              className={inputStyle}
                              value={formData[lineName][time][key]}
                              onChange={(e) =>
                                handleChange(
                                  lineName,
                                  time,
                                  key,
                                  numericOnly(e.target.value),
                                )
                              }
                            />
                          </div>
                        ))}
                        {/* Dryer Temps */}
                        <div>
                          <label className={labelStyle}>Dryer Temp (°C)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="T1"
                              className={inputStyle}
                              value={formData[lineName][time].dryerTemp1}
                              onChange={(e) =>
                                handleChange(
                                  lineName,
                                  time,
                                  "dryerTemp1",
                                  numericOnly(e.target.value),
                                )
                              }
                            />
                            <input
                              type="text"
                              placeholder="T2"
                              className={inputStyle}
                              value={formData[lineName][time].dryerTemp2}
                              onChange={(e) =>
                                handleChange(
                                  lineName,
                                  time,
                                  "dryerTemp2",
                                  numericOnly(e.target.value),
                                )
                              }
                            />
                          </div>
                        </div>
                        {/* Moisture */}
                        <div>
                          <label className={labelStyle}>% Moisture</label>
                          <input
                            type="text"
                            className={`${inputStyle} ${moisture > 8 ? "border-red-500 focus:ring-red-500" : ""}`}
                            value={formData[lineName][time].moisture}
                            onChange={(e) =>
                              handleChange(
                                lineName,
                                time,
                                "moisture",
                                numericOnly(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
