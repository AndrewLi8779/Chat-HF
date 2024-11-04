import { useCallback, useState } from "react";

// Recursive function to search by ID
export const findById = (obj, targetId) => {
  // Base case: check if the current object matches the targetId
  if (obj.name === targetId) {
    return obj;
  }

  // Recursive case: search in children
  if (obj.children && obj.children.length > 0) {
    for (let child of obj.children) {
      const result = findById(child, targetId);
      if (result) {
        return result;
      }
    }
  }

  // If not found, return null
  return null;
}

export const findParentByID = (obj, targetId) => {
  const foundChild = obj.children.find(child => child.name === targetId);
  if (foundChild) {
    return obj;
  }

  if (obj.children && obj.children.length > 0) {
    for (let child of obj.children) {
      const result = findParentByID(child, targetId);
      if (result) {
        return result; // Return the result if found in a child
      }
    }
  }

  return null;
}

// Recursive function to search by ID
export const findMessageID = (obj, targetId) => {
  // Base case: check if the current object matches the targetId
  const foundMessage = obj.messages.find(msg => msg.id === targetId);
  if (foundMessage) {
    return obj; // Return the current object if the message is found
  }

  // Recursive case: search in children
  if (obj.children && obj.children.length > 0) {
    for (let child of obj.children) {
      const result = findMessageID(child, targetId);
      if (result) {
        return result; // Return the result if found in a child
      }
    }
  }

  // If not found, return null
  return null;
}

export const getLeafNodes = (node) => {
  if (node.children.length === 0) {
    return [node];
  }

  let leaves = [];
  for (const child of node.children) {
    leaves = leaves.concat(getLeafNodes(child));
  }

  return leaves;
};


export const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState(defaultTranslate);
  const [dimensions, setDimensions] = useState();
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect();
      setDimensions({ width, height });
      setTranslate({ x: width / 2, y: height / 2 });
    }
  }, []);
  return [dimensions, translate, containerRef];
};