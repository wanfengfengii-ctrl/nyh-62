import { PressParams, ValidationResult } from "../types";

export function validateParams(params: PressParams): ValidationResult {
  const errors: ValidationResult["errors"] = [];

  if (params.leverLength <= 0) {
    errors.push({
      field: "leverLength",
      message: "杠杆长度必须大于 0",
    });
  } else if (params.leverLength > 12) {
    errors.push({
      field: "leverLength",
      message: "杠杆长度不能超过 12 米",
    });
  }

  if (params.stoneWeight <= 0) {
    errors.push({
      field: "stoneWeight",
      message: "压石重量必须大于 0",
    });
  } else if (params.stoneWeight > 2000) {
    errors.push({
      field: "stoneWeight",
      message: "压石重量不能超过 2000 千克",
    });
  }

  if (params.fruitWeight <= 0) {
    errors.push({
      field: "fruitWeight",
      message: "果料重量必须大于 0",
    });
  } else if (params.fruitWeight > 500) {
    errors.push({
      field: "fruitWeight",
      message: "果料重量不能超过 500 千克",
    });
  }

  if (params.moistureContent < 0 || params.moistureContent > 100) {
    errors.push({
      field: "moistureContent",
      message: "含水率必须在 0 到 100 之间",
    });
  }

  if (params.plateDiameter <= 0) {
    errors.push({
      field: "plateDiameter",
      message: "压盘直径必须大于 0",
    });
  } else if (params.plateDiameter > 2) {
    errors.push({
      field: "plateDiameter",
      message: "压盘直径不能超过 2 米",
    });
  }

  if (params.fulcrumPosition <= 0 || params.fulcrumPosition >= 1) {
    errors.push({
      field: "fulcrumPosition",
      message: "压石挂点比例必须在 0 到 1 之间",
    });
  } else if (params.fulcrumPosition * params.leverLength < 0.8) {
    errors.push({
      field: "fulcrumPosition",
      message: `压石挂点距离支点至少需 0.8m（当前比例下仅 ${(params.fulcrumPosition * params.leverLength).toFixed(2)}m），请增大杠杆或调高挂点比例`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
