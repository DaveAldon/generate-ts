import { Characters } from '../enums/characters.enum';
import { paths } from '../enums/paths.enum';
import { FoundFile, GeneratePatternOptions } from '..';
import { findFiles } from '../fileFinder/fileFinder';
import { convertToCodePattern } from '../utilities/typeManagers';
import { writeFile } from './writeFile';

/** Searches for files that fit the pattern, and returns a code string based on the given code patter.
 * @param filePath The path and name of the generated file to be made, like 'src/Example/test.ts'.
 * @param fileNamePattern The pattern to search files for. Best if used as an extension, like '.screen.ts'.
 * @param codePatterns An array of string patterns to apply to found files:
 * Example pattern: "import { $name } from '$importPath';"
 * ```
 * - '$name' gets the first section of the file name: "MyScreen"
 * - '$fileName' gets the entire file name: "MyScreen.screen.ts"
 * - '$importPath' gets the file path without the last extension: "src/screens/MyScreen.screen"
 * - '$path' gets the full path: "src/screens/MyScreen.screen.ts"
 * ```
 * @param options Options for the search
 * ```
 * - folder: The folder to search in. Defaults to './'
 * ```
 */
export const generatePattern = ({
  filePath,
  fileNamePattern,
  codePatterns,
  options,
}: GeneratePatternOptions) => {
  const { folder = paths.root } = options || {};
  const files = findFiles(folder || paths.root, fileNamePattern);
  let code = ``;

  convertToCodePattern(codePatterns).forEach(codePattern => {
    code += codePattern.documentation ? `// ${codePattern.documentation}\n` : ``;
    code += codePattern.prePattern ? `${codePattern.prePattern}\n` : ``;
    files.forEach(file => {
      code += `${replacePatternIdentifiers(codePattern.pattern, file)}\n`;
    });
    code += codePattern.postPattern ? `${codePattern.postPattern}\n` : ``;
    code += `${Characters.Space}\n`;
  });
  writeFile(filePath, code);
  console.log(`Successfully generated ${filePath}`);
};

const replacePatternIdentifiers = (pattern: string, file: FoundFile) => {
  return pattern
    .replaceAll('$name', file.name)
    .replaceAll('$importName', file.importName)
    .replaceAll('$path', file.path)
    .replaceAll('$fileName', file.fileName);
};
