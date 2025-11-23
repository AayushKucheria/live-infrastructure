// Diverse situation samples for random population in abnormality creation form
// These samples vary in formality, detection context, and writing style

export const SITUATION_SAMPLES: string[] = [
  // Informal - Wastewater detection
  "So we're seeing weird stuff in the wastewater samples from downtown. Not sure what it is but the numbers are definitely off. The sequencing came back with markers we haven't seen before. We've got about 20 samples collected over the past week and they all show similar anomalies. Hospital admissions in the area are also up, but we're not sure if it's related yet.",
  
  // Semi-formal - Clinical surveillance
  "Our clinical surveillance network has detected an unusual cluster of respiratory cases in the past week. Initial testing shows markers we haven't seen before. We've collected samples from 15 patients across three hospitals. The cases are concentrated in adults aged 30-50, which is unusual. Chest X-rays show bilateral infiltrates and standard antibiotic treatments aren't showing much effect.",
  
  // Formal - Airport screening
  "Genomic sequencing analysis of samples collected from airport screening stations indicates novel genetic markers with 78% similarity to known pathogens but with significant variations in the spike protein region. The samples were collected over a 5-day period from travelers arriving from Southeast Asia. We've identified 12 positive cases with consistent genetic signatures. Further analysis is required to determine pathogenicity and transmission characteristics.",
  
  // Informal - Hospital outbreak
  "We've got a situation at the main hospital. Three patients came in with what looks like atypical pneumonia but none of the usual tests are coming back positive. They're all from the same neighborhood. We're seeing rapid progression in two of them. The lab is running more tests but we're worried this might spread. We've isolated them but need to figure out what we're dealing with.",
  
  // Semi-formal - Environmental monitoring
  "Environmental monitoring systems have flagged unusual patterns in air quality data from industrial zones. The sensors are detecting particulate matter with biological signatures that don't match known local sources. We've deployed additional sampling equipment and are seeing consistent readings across multiple monitoring stations. Correlation with local health data shows a slight uptick in respiratory complaints, but we need more data to establish causation.",
  
  // Formal - Genetic sequencing anomaly
  "Laboratory analysis of genetic sequencing data has revealed an anomalous pattern in pathogen surveillance samples. The sequences show 85% homology with known influenza variants but contain novel mutations in the hemagglutinin gene that suggest potential antigenic drift. Samples were collected from 47 patients across multiple healthcare facilities. Preliminary epidemiological analysis indicates possible clustering in specific geographic regions. Further investigation is required to assess public health implications and determine appropriate response protocols."
];

/**
 * Get a random situation sample
 */
export function getRandomSituationSample(): string {
  const randomIndex = Math.floor(Math.random() * SITUATION_SAMPLES.length);
  return SITUATION_SAMPLES[randomIndex];
}

